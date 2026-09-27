package com.mitu.assistant.native

import android.content.Context
import android.content.Intent
import android.os.Handler
import android.os.Looper
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import java.util.Locale

interface WakeWordDetector {
    fun start()
    fun stop()
}

/**
 * Uses Android's offline-preferred speech recognizer as the default engine.
 * The detector matches both the Latin and Bengali wake words and is isolated
 * behind an interface so a dedicated on-device wake-word model can replace it.
 */
class AndroidSpeechWakeWordDetector(
    context: Context,
    private val onWakeWord: () -> Unit,
) : WakeWordDetector {
    private val appContext = context.applicationContext
    private val handler = Handler(Looper.getMainLooper())
    private var running = false
    private var recognizer: SpeechRecognizer? = null

    override fun start() {
        if (running || !SpeechRecognizer.isRecognitionAvailable(appContext)) return
        running = true
        handler.post {
            recognizer = SpeechRecognizer.createSpeechRecognizer(appContext).also {
                it.setRecognitionListener(listener)
            }
            listen()
        }
    }

    override fun stop() {
        running = false
        handler.removeCallbacksAndMessages(null)
        recognizer?.cancel()
        recognizer?.destroy()
        recognizer = null
    }

    private fun listen() {
        if (!running) return
        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
            putExtra(RecognizerIntent.EXTRA_PREFER_OFFLINE, true)
            putExtra(RecognizerIntent.EXTRA_LANGUAGE, "bn-BD")
        }
        runCatching { recognizer?.startListening(intent) }
    }

    private fun handleMatches(results: ArrayList<String>?) {
        results.orEmpty().firstOrNull { containsWakeWord(it) }?.let {
            onWakeWord()
            recognizer?.cancel()
            handler.postDelayed({ listen() }, RESTART_DELAY_MS)
        }
    }

    private val listener = object : RecognitionListener {
        override fun onReadyForSpeech(params: android.os.Bundle?) = Unit
        override fun onBeginningOfSpeech() = Unit
        override fun onRmsChanged(rmsdB: Float) = Unit
        override fun onBufferReceived(buffer: ByteArray?) = Unit
        override fun onEndOfSpeech() {
            if (running) handler.postDelayed({ listen() }, RESTART_DELAY_MS)
        }
        override fun onError(error: Int) {
            if (running) handler.postDelayed({ listen() }, RESTART_DELAY_MS)
        }
        override fun onResults(results: android.os.Bundle?) {
            handleMatches(results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION))
        }
        override fun onPartialResults(partialResults: android.os.Bundle?) {
            handleMatches(partialResults?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION))
        }
        override fun onEvent(eventType: Int, params: android.os.Bundle?) = Unit
    }

    companion object {
        private const val RESTART_DELAY_MS = 350L

        fun containsWakeWord(transcript: String): Boolean {
            val normalized = transcript
                .lowercase(Locale.ROOT)
                .replace(Regex("[^\\p{L}\\p{N}\\s]"), " ")
                .replace(Regex("\\s+"), " ")
                .trim()
            return normalized.split(' ').any { it == "mitu" || it == "মিতু" }
        }
    }
}