---
name: Android build environment
description: Android Gradle and MediaPipe verification constraints for this workspace
---

Use the Google Maven version list when selecting MediaPipe Tasks artifacts; a version that looks current may not exist in every Maven repository.

**Why:** The native build initially referenced an unpublished MediaPipe version, while the Android dependency was available from Google Maven at a different version. The Replit container's GraalVM also failed AGP's `jlink` Android JDK-image transform after Kotlin compilation; standard JDK 17 in CI is the supported verification path.

**How to apply:** Keep Android CI on a standard Temurin JDK and resolve MediaPipe versions from Google's Maven metadata before changing the dependency.