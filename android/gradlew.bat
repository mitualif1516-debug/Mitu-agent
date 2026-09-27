@ECHO OFF
SET APP_HOME=%~dp0
where java >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
  ECHO Java is required to run the Gradle wrapper. Install JDK 17 or newer.
  EXIT /B 1
)
java %JAVA_OPTS% -classpath "%APP_HOME%gradle\wrapper\gradle-wrapper.jar" org.gradle.wrapper.GradleWrapperMain %*