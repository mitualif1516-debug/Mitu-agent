package com.mitu.assistant.native

import android.content.Context
import com.google.mlkit.common.model.DownloadConditions
import com.google.mlkit.nl.translate.Translation
import com.google.mlkit.nl.translate.TranslatorOptions
import kotlinx.coroutines.tasks.await

data class LocalTranslation(
    val text: String,
    val provider: String,
)

class TranslationRepository(
    context: Context,
    private val api: MituApiClient,
) {
    private val appContext = context.applicationContext

    suspend fun translate(
        text: String,
        sourceLanguage: String,
        targetLanguage: String,
    ): LocalTranslation {
        val remote = runCatching {
            api.translate(text, sourceLanguage, targetLanguage)
        }.getOrNull()
        if (remote != null && remote.provider != "passthrough-fallback") {
            return LocalTranslation(remote.text, remote.provider)
        }

        val options = TranslatorOptions.Builder()
            .setSourceLanguage(sourceLanguage)
            .setTargetLanguage(targetLanguage)
            .build()
        val translator = Translation.getClient(options)
        return try {
            translator.downloadModelIfNeeded(
                DownloadConditions.Builder().requireWifi().build(),
            ).await()
            LocalTranslation(translator.translate(text).await(), "mlkit-on-device")
        } finally {
            translator.close()
        }
    }
}