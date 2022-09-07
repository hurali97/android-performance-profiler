#!/usr/bin/env bash

ABI=$1
PATH_TO_CMAKE=/Users/hurali/Library/Android/sdk/cmake/3.18.1/bin/cmake
PATH_TO_NDK=/Users/hurali/Library/Android/sdk/ndk/24.0.8215888

# A better config would be to have one build folder per architecture
rm -rf CMakeFiles CMakeCache.txt BAMPerfProfiler
$PATH_TO_CMAKE \
  -DCMAKE_TOOLCHAIN_FILE=$PATH_TO_NDK/build/cmake/android.toolchain.cmake \
  -DANDROID_PLATFORM=android-23 \
  -DANDROID_ABI=$ABI \
  -DCMAKE_ANDROID_ARCH_ABI=$ABI
$PATH_TO_CMAKE --build .
