# Android APK 项目

此目录包含将贪吃蛇包装为 Android 应用的 Android Studio 项目。游戏网页资源放在 `app/src/main/assets/`，应用使用本机 WebView 加载，运行时无需联网。

## 构建 APK

使用 Android Studio 打开 `Android/` 文件夹，等待 Gradle 同步完成，然后选择 **Build > Build APK(s)**。生成的调试 APK 位于 `app/build/outputs/apk/debug/app-debug.apk`。

也可以在已安装 JDK 与 Android SDK 的电脑上，从此目录运行 `gradle assembleDebug`。
