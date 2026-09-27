package com.mitu.assistant.native

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import java.util.Locale

class VoiceCommandProcessor(context: Context) {
    private val appContext = context.applicationContext

    fun listen(
        activity: Activity,
        onTranscript: (String) -> Unit,
        onError: (Throwable) -> Unit,
    ) {
        if (!SpeechRecognizer.isRecognitionAvailable(appContext)) {
            onError(IllegalStateException("Speech recognition is not available on this device."))
            return
        }
        val recognizer = SpeechRecognizer.createSpeechRecognizer(activity)
        recognizer.setRecognitionListener(object : RecognitionListener {
            override fun onReadyForSpeech(params: android.os.Bundle?) = Unit
            override fun onBeginningOfSpeech() = Unit
            override fun onRmsChanged(rmsdB: Float) = Unit
            override fun onBufferReceived(buffer: ByteArray?) = Unit
            override fun onEndOfSpeech() = Unit
            override fun onError(error: Int) {
                recognizer.destroy()
                onError(IllegalStateException("Speech recognition failed with code $error."))
            }
            override fun onResults(results: android.os.Bundle?) {
                val transcript = results
                    ?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                    ?.firstOrNull()
                recognizer.destroy()
                if (transcript.isNullOrBlank()) {
                    onError(IllegalStateException("No speech was recognized."))
                } else {
                    onTranscript(transcript)
                }
            }
            override fun onPartialResults(partialResults: android.os.Bundle?) = Unit
            override fun onEvent(eventType: Int, params: android.os.Bundle?) = Unit
        })
        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            putExtra(RecognizerIntent.EXTRA_LANGUAGE, Locale.getDefault().toLanguageTag())
            putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, false)
            putExtra(RecognizerIntent.EXTRA_PREFER_OFFLINE, true)
        }
        recognizer.startListening(intent)
    }
}

sealed interface CommandResult {
    data object NotHandled : CommandResult
    data class Completed(val message: String) : CommandResult
    data class Failed(val message: String) : CommandResult
}

class AssistantCommandRouter(
    private val usageRepository: UsageRepository,
    private val whatsAppNavigator: WhatsAppNavigator,
) {
    suspend fun route(transcript: String): CommandResult {
        val normalized = transcript.lowercase(Locale.ROOT)
        val isWhatsAppCommand =
            normalized.contains("whatsapp") ||
                normalized.contains("হোয়াটসঅ্যাপ") ||
                normalized.contains("হোয়াটসঅ্যাপ")
        if (!isWhatsAppCommand) return CommandResult.NotHandled

        val phone = PHONE_PATTERN.find(normalized)?.value
        if (phone.isNullOrBlank()) {
            return CommandResult.Failed("Say the WhatsApp contact number after the command.")
        }
        return runCatching {
            usageRepository.recordAction("voice")
            if (!whatsAppNavigator.openChat(phone)) {
                CommandResult.Failed("WhatsApp is not installed or the chat could not be opened.")
            } else {
                CommandResult.Completed("WhatsApp chat opened.")
            }
        }.getOrElse { error ->
            CommandResult.Failed(error.message ?: "The assistant action could not be completed.")
        }
    }

    companion object {
        private val PHONE_PATTERN = Regex("""\+?\d[\d\s()-]{6,}\d""")
    }
}