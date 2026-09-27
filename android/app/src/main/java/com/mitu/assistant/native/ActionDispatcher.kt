package com.mitu.assistant.native

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.GestureDescription
import android.graphics.Path
import android.os.Build

/**
 * Converts recognized hand gestures into accessibility actions. Keeping this
 * mapping separate makes MediaPipe replaceable without changing automation.
 */
class ActionDispatcher {
    fun dispatch(action: GestureAction, service: AccessibilityService): Boolean {
        return when (action) {
            GestureAction.BACK -> service.performGlobalAction(AccessibilityService.GLOBAL_ACTION_BACK)
            GestureAction.HOME -> service.performGlobalAction(AccessibilityService.GLOBAL_ACTION_HOME)
            GestureAction.RECENTS -> service.performGlobalAction(AccessibilityService.GLOBAL_ACTION_RECENTS)
            GestureAction.SWIPE_LEFT -> swipe(service, 820f, 900f, 180f, 900f)
            GestureAction.SWIPE_RIGHT -> swipe(service, 180f, 900f, 820f, 900f)
            GestureAction.PINCH -> true
        }
    }

    private fun swipe(
        service: AccessibilityService,
        startX: Float,
        startY: Float,
        endX: Float,
        endY: Float,
    ): Boolean {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.N) return false
        val path = Path().apply {
            moveTo(startX, startY)
            lineTo(endX, endY)
        }
        val gesture = GestureDescription.Builder()
            .addStroke(GestureDescription.StrokeDescription(path, 0, 350))
            .build()
        return service.dispatchGesture(gesture, null, null)
    }
}

enum class GestureAction {
    BACK,
    HOME,
    RECENTS,
    SWIPE_LEFT,
    SWIPE_RIGHT,
    PINCH,
}