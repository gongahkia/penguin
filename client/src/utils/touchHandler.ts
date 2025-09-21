interface TouchGesture {
  type: 'tap' | 'long-press' | 'swipe' | 'pinch' | 'rotate' | 'pan';
  startTime: number;
  startPosition: { x: number; y: number };
  currentPosition: { x: number; y: number };
  velocity?: { x: number; y: number };
  distance?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  scale?: number;
  rotation?: number;
  target: HTMLElement;
}

interface TouchHandlerOptions {
  enableTap?: boolean;
  enableLongPress?: boolean;
  enableSwipe?: boolean;
  enablePinch?: boolean;
  enableRotate?: boolean;
  enablePan?: boolean;
  tapThreshold?: number;
  longPressThreshold?: number;
  swipeThreshold?: number;
  preventDefaults?: boolean;
}

interface TouchCallbacks {
  onTap?: (gesture: TouchGesture) => void;
  onLongPress?: (gesture: TouchGesture) => void;
  onSwipeStart?: (gesture: TouchGesture) => void;
  onSwipe?: (gesture: TouchGesture) => void;
  onSwipeEnd?: (gesture: TouchGesture) => void;
  onPinchStart?: (gesture: TouchGesture) => void;
  onPinch?: (gesture: TouchGesture) => void;
  onPinchEnd?: (gesture: TouchGesture) => void;
  onRotateStart?: (gesture: TouchGesture) => void;
  onRotate?: (gesture: TouchGesture) => void;
  onRotateEnd?: (gesture: TouchGesture) => void;
  onPanStart?: (gesture: TouchGesture) => void;
  onPan?: (gesture: TouchGesture) => void;
  onPanEnd?: (gesture: TouchGesture) => void;
}

class TouchHandler {
  private element: HTMLElement;
  private options: TouchHandlerOptions;
  private callbacks: TouchCallbacks;
  private activeTouches = new Map<number, Touch>();
  private currentGesture: TouchGesture | null = null;
  private longPressTimer: NodeJS.Timeout | null = null;
  private lastTapTime = 0;
  private tapCount = 0;

  constructor(element: HTMLElement, options: TouchHandlerOptions = {}, callbacks: TouchCallbacks = {}) {
    this.element = element;
    this.options = {
      enableTap: true,
      enableLongPress: true,
      enableSwipe: true,
      enablePinch: true,
      enableRotate: true,
      enablePan: true,
      tapThreshold: 10,
      longPressThreshold: 500,
      swipeThreshold: 50,
      preventDefaults: true,
      ...options
    };
    this.callbacks = callbacks;

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.element.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    this.element.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    this.element.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
    this.element.addEventListener('touchcancel', this.handleTouchCancel.bind(this), { passive: false });

    // Add mouse events for desktop testing
    this.element.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.element.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.element.addEventListener('mouseup', this.handleMouseUp.bind(this));
    this.element.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
  }

  private handleTouchStart(event: TouchEvent): void {
    if (this.options.preventDefaults) {
      event.preventDefault();
    }

    const touch = event.changedTouches[0];
    this.activeTouches.set(touch.identifier, touch);

    if (this.activeTouches.size === 1) {
      this.startSingleTouchGesture(touch);
    } else if (this.activeTouches.size === 2) {
      this.startMultiTouchGesture();
    }
  }

  private handleTouchMove(event: TouchEvent): void {
    if (this.options.preventDefaults) {
      event.preventDefault();
    }

    for (const touch of Array.from(event.changedTouches)) {
      this.activeTouches.set(touch.identifier, touch);
    }

    if (this.currentGesture) {
      this.updateGesture(event);
    }
  }

  private handleTouchEnd(event: TouchEvent): void {
    if (this.options.preventDefaults) {
      event.preventDefault();
    }

    for (const touch of Array.from(event.changedTouches)) {
      this.activeTouches.delete(touch.identifier);
    }

    if (this.activeTouches.size === 0) {
      this.endGesture();
    } else if (this.activeTouches.size === 1 && this.currentGesture?.type === 'pinch') {
      this.endGesture();
      const remainingTouch = Array.from(this.activeTouches.values())[0];
      this.startSingleTouchGesture(remainingTouch);
    }
  }

  private handleTouchCancel(event: TouchEvent): void {
    this.activeTouches.clear();
    this.endGesture();
  }

  private startSingleTouchGesture(touch: Touch): void {
    const position = { x: touch.clientX, y: touch.clientY };

    this.currentGesture = {
      type: 'tap',
      startTime: Date.now(),
      startPosition: position,
      currentPosition: position,
      target: this.element
    };

    // Start long press timer
    if (this.options.enableLongPress) {
      this.longPressTimer = setTimeout(() => {
        if (this.currentGesture && this.currentGesture.type === 'tap') {
          this.currentGesture.type = 'long-press';
          this.callbacks.onLongPress?.(this.currentGesture);
        }
      }, this.options.longPressThreshold);
    }
  }

  private startMultiTouchGesture(): void {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }

    const touches = Array.from(this.activeTouches.values());
    if (touches.length >= 2) {
      const touch1 = touches[0];
      const touch2 = touches[1];

      const centerX = (touch1.clientX + touch2.clientX) / 2;
      const centerY = (touch1.clientY + touch2.clientY) / 2;

      this.currentGesture = {
        type: 'pinch',
        startTime: Date.now(),
        startPosition: { x: centerX, y: centerY },
        currentPosition: { x: centerX, y: centerY },
        scale: 1,
        rotation: 0,
        target: this.element
      };

      if (this.options.enablePinch) {
        this.callbacks.onPinchStart?.(this.currentGesture);
      }
    }
  }

  private updateGesture(event: TouchEvent): void {
    if (!this.currentGesture) return;

    const touches = Array.from(this.activeTouches.values());

    if (this.currentGesture.type === 'tap' || this.currentGesture.type === 'long-press') {
      this.updateSingleTouchGesture(touches[0]);
    } else if (this.currentGesture.type === 'pinch') {
      this.updateMultiTouchGesture(touches);
    }
  }

  private updateSingleTouchGesture(touch: Touch): void {
    if (!this.currentGesture) return;

    const currentPosition = { x: touch.clientX, y: touch.clientY };
    const deltaX = currentPosition.x - this.currentGesture.startPosition.x;
    const deltaY = currentPosition.y - this.currentGesture.startPosition.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    this.currentGesture.currentPosition = currentPosition;
    this.currentGesture.distance = distance;

    // Determine if this is a swipe or pan
    if (distance > this.options.swipeThreshold! && this.currentGesture.type === 'tap') {
      if (this.longPressTimer) {
        clearTimeout(this.longPressTimer);
        this.longPressTimer = null;
      }

      // Determine swipe direction
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      if (absX > absY) {
        this.currentGesture.direction = deltaX > 0 ? 'right' : 'left';
      } else {
        this.currentGesture.direction = deltaY > 0 ? 'down' : 'up';
      }

      if (this.options.enableSwipe) {
        this.currentGesture.type = 'swipe';
        this.callbacks.onSwipeStart?.(this.currentGesture);
      } else if (this.options.enablePan) {
        this.currentGesture.type = 'pan';
        this.callbacks.onPanStart?.(this.currentGesture);
      }
    }

    // Continue swipe or pan
    if (this.currentGesture.type === 'swipe' && this.options.enableSwipe) {
      this.callbacks.onSwipe?.(this.currentGesture);
    } else if (this.currentGesture.type === 'pan' && this.options.enablePan) {
      this.callbacks.onPan?.(this.currentGesture);
    }
  }

  private updateMultiTouchGesture(touches: Touch[]): void {
    if (!this.currentGesture || touches.length < 2) return;

    const touch1 = touches[0];
    const touch2 = touches[1];

    const currentDistance = this.getDistance(touch1, touch2);
    const startDistance = this.getDistance(
      { clientX: this.currentGesture.startPosition.x, clientY: this.currentGesture.startPosition.y } as Touch,
      { clientX: this.currentGesture.startPosition.x, clientY: this.currentGesture.startPosition.y } as Touch
    );

    this.currentGesture.scale = currentDistance / startDistance || 1;

    const currentAngle = this.getAngle(touch1, touch2);
    const startAngle = this.getAngle(
      { clientX: this.currentGesture.startPosition.x, clientY: this.currentGesture.startPosition.y } as Touch,
      { clientX: this.currentGesture.startPosition.x, clientY: this.currentGesture.startPosition.y } as Touch
    );

    this.currentGesture.rotation = currentAngle - startAngle;

    if (this.options.enablePinch) {
      this.callbacks.onPinch?.(this.currentGesture);
    }

    if (this.options.enableRotate) {
      this.callbacks.onRotate?.(this.currentGesture);
    }
  }

  private endGesture(): void {
    if (!this.currentGesture) return;

    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }

    const gesture = this.currentGesture;
    const duration = Date.now() - gesture.startTime;

    // Calculate velocity for swipe gestures
    if (gesture.type === 'swipe' || gesture.type === 'pan') {
      const deltaX = gesture.currentPosition.x - gesture.startPosition.x;
      const deltaY = gesture.currentPosition.y - gesture.startPosition.y;
      gesture.velocity = {
        x: deltaX / duration,
        y: deltaY / duration
      };
    }

    // Handle gesture completion
    switch (gesture.type) {
      case 'tap':
        if (this.options.enableTap && (gesture.distance || 0) < this.options.tapThreshold!) {
          this.handleTap(gesture);
        }
        break;

      case 'swipe':
        if (this.options.enableSwipe) {
          this.callbacks.onSwipeEnd?.(gesture);
        }
        break;

      case 'pan':
        if (this.options.enablePan) {
          this.callbacks.onPanEnd?.(gesture);
        }
        break;

      case 'pinch':
        if (this.options.enablePinch) {
          this.callbacks.onPinchEnd?.(gesture);
        }
        break;
    }

    this.currentGesture = null;
  }

  private handleTap(gesture: TouchGesture): void {
    const now = Date.now();
    const timeSinceLastTap = now - this.lastTapTime;

    if (timeSinceLastTap < 300) {
      this.tapCount++;
    } else {
      this.tapCount = 1;
    }

    this.lastTapTime = now;

    // Emit tap after a short delay to detect double taps
    setTimeout(() => {
      if (this.tapCount === 1) {
        this.callbacks.onTap?.(gesture);
      } else if (this.tapCount === 2) {
        // Handle double tap
        this.callbacks.onTap?.({ ...gesture, type: 'tap' });
      }
      this.tapCount = 0;
    }, 300);
  }

  private getDistance(touch1: Touch, touch2: Touch): number {
    const deltaX = touch2.clientX - touch1.clientX;
    const deltaY = touch2.clientY - touch1.clientY;
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  }

  private getAngle(touch1: Touch, touch2: Touch): number {
    const deltaX = touch2.clientX - touch1.clientX;
    const deltaY = touch2.clientY - touch1.clientY;
    return Math.atan2(deltaY, deltaX) * 180 / Math.PI;
  }

  // Mouse event handlers for desktop testing
  private handleMouseDown(event: MouseEvent): void {
    const touch = this.createTouchFromMouse(event, 0);
    this.activeTouches.set(0, touch);
    this.startSingleTouchGesture(touch);
  }

  private handleMouseMove(event: MouseEvent): void {
    if (this.activeTouches.has(0)) {
      const touch = this.createTouchFromMouse(event, 0);
      this.activeTouches.set(0, touch);
      this.updateSingleTouchGesture(touch);
    }
  }

  private handleMouseUp(event: MouseEvent): void {
    this.activeTouches.delete(0);
    this.endGesture();
  }

  private handleMouseLeave(event: MouseEvent): void {
    this.activeTouches.clear();
    this.endGesture();
  }

  private createTouchFromMouse(event: MouseEvent, identifier: number): Touch {
    return {
      identifier,
      clientX: event.clientX,
      clientY: event.clientY,
      screenX: event.screenX,
      screenY: event.screenY,
      pageX: event.pageX,
      pageY: event.pageY,
      radiusX: 0,
      radiusY: 0,
      rotationAngle: 0,
      force: 0.5,
      target: event.target as Element
    } as Touch;
  }

  destroy(): void {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
    }

    this.element.removeEventListener('touchstart', this.handleTouchStart.bind(this));
    this.element.removeEventListener('touchmove', this.handleTouchMove.bind(this));
    this.element.removeEventListener('touchend', this.handleTouchEnd.bind(this));
    this.element.removeEventListener('touchcancel', this.handleTouchCancel.bind(this));

    this.element.removeEventListener('mousedown', this.handleMouseDown.bind(this));
    this.element.removeEventListener('mousemove', this.handleMouseMove.bind(this));
    this.element.removeEventListener('mouseup', this.handleMouseUp.bind(this));
    this.element.removeEventListener('mouseleave', this.handleMouseLeave.bind(this));
  }
}

export { TouchHandler, TouchGesture, TouchHandlerOptions, TouchCallbacks };
export default TouchHandler;