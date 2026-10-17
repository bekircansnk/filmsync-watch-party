#!/bin/bash
set -euo pipefail

BUILD_DIR="/tmp/filmsync_safari_build"
SRC_EXT="/Users/bekir/Uygulamalarim/12-FilmSync/extension"
APP_NAME="Film Partisi"
APP_DIR="${BUILD_DIR}/${APP_NAME}.app"
APPEX_DIR="${APP_DIR}/Contents/PlugIns/${APP_NAME} Extension.appex"
HOST_BUNDLE_ID="com.bekir.filmsync"
EXT_BUNDLE_ID="com.bekir.filmsync.Extension"

echo "1. Klasor yapisi olusturuluyor..."
rm -rf "${APP_DIR}"
mkdir -p "${APP_DIR}/Contents/MacOS"
mkdir -p "${APP_DIR}/Contents/Resources"
mkdir -p "${APPEX_DIR}/Contents/MacOS"
mkdir -p "${APPEX_DIR}/Contents/Resources"

echo "2. Ikon kopyalaniyor..."
cp "${BUILD_DIR}/AppIcon.icns" "${APP_DIR}/Contents/Resources/AppIcon.icns"
cp "${BUILD_DIR}/AppIcon.icns" "${APPEX_DIR}/Contents/Resources/AppIcon.icns"

echo "3. Eklenti web dosyalari kopyalaniyor..."
cp -R "${SRC_EXT}/"* "${APPEX_DIR}/Contents/Resources/"

echo "4. Host App kaynak kodu derleniyor..."
cat << 'OBJC_HOST' > "${BUILD_DIR}/host_app.m"
#import <Cocoa/Cocoa.h>
#import <SafariServices/SafariServices.h>

@interface AppDelegate : NSObject <NSApplicationDelegate>
@property (strong, nonatomic) NSWindow *window;
@end

@implementation AppDelegate
- (void)applicationDidFinishLaunching:(NSNotification *)aNotification {
    NSRect frame = NSMakeRect(0, 0, 480, 260);
    self.window = [[NSWindow alloc] initWithContentRect:frame
                                              styleMask:(NSWindowStyleMaskTitled | NSWindowStyleMaskClosable | NSWindowStyleMaskMiniaturizable)
                                                backing:NSBackingStoreBuffered
                                                  defer:NO];
    [self.window setTitle:@"Film Partisi"];
    [self.window center];
    
    NSTextField *label = [[NSTextField alloc] initWithFrame:NSMakeRect(20, 110, 440, 60)];
    [label setStringValue:@"Film Partisi Safari Eklentisi Başarıyla Yüklendi.\nSafari Ayarları > Genişletmeler menüsünden kontrol edebilirsiniz."];
    [label setBezeled:NO];
    [label setDrawsBackground:NO];
    [label setEditable:NO];
    [label setSelectable:NO];
    [label setAlignment:NSTextAlignmentCenter];
    [label setFont:[NSFont systemFontOfSize:14 weight:NSFontWeightMedium]];
    
    NSButton *button = [[NSButton alloc] initWithFrame:NSMakeRect(140, 40, 200, 36)];
    [button setTitle:@"Safari Ayarlarını Aç"];
    [button setBezelStyle:NSBezelStyleRounded];
    [button setTarget:self];
    [button setAction:@selector(openSafariSettings:)];
    
    [[self.window contentView] addSubview:label];
    [[self.window contentView] addSubview:button];
    [self.window makeKeyAndOrderFront:nil];
    [NSApp activateIgnoringOtherApps:YES];
}

- (void)openSafariSettings:(id)sender {
    [SFSafariApplication showPreferencesForExtensionWithIdentifier:@"com.bekir.filmsync.Extension" completionHandler:nil];
}

- (BOOL)applicationShouldTerminateAfterLastWindowClosed:(NSApplication *)sender {
    return YES;
}
@end

int main(int argc, const char * argv[]) {
    @autoreleasepool {
        NSApplication *app = [NSApplication sharedApplication];
        AppDelegate *delegate = [[AppDelegate alloc] init];
        [app setDelegate:delegate];
        [app run];
    }
    return 0;
}
OBJC_HOST

clang -fmodules -framework Cocoa -framework SafariServices -target arm64-apple-macos13.0 \
    "${BUILD_DIR}/host_app.m" -o "${APP_DIR}/Contents/MacOS/${APP_NAME}"

echo "5. Extension Appex binary derleniyor..."
cat << 'OBJC_EXT' > "${BUILD_DIR}/extension_handler.m"
#import <Foundation/Foundation.h>
#import <SafariServices/SafariServices.h>

@interface SafariWebExtensionHandler : NSObject <NSExtensionRequestHandling>
@end

@implementation SafariWebExtensionHandler
- (void)beginRequestWithExtensionContext:(NSExtensionContext *)context {
    NSExtensionItem *response = [[NSExtensionItem alloc] init];
    [context completeRequestReturningItems:@[response] completionHandler:nil];
}
@end

extern int NSExtensionMain(int argc, const char * argv[]);

int main(int argc, const char * argv[]) {
    return NSExtensionMain(argc, argv);
}
OBJC_EXT

clang -fmodules -framework Foundation -framework SafariServices -target arm64-apple-macos13.0 \
    "${BUILD_DIR}/extension_handler.m" -o "${APPEX_DIR}/Contents/MacOS/${APP_NAME} Extension"

echo "6. Info.plist dosyalari olusturuluyor..."
cat << PLIST_HOST > "${APP_DIR}/Contents/Info.plist"
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>CFBundleDevelopmentRegion</key>
	<string>tr</string>
	<key>CFBundleDisplayName</key>
	<string>${APP_NAME}</string>
	<key>CFBundleExecutable</key>
	<string>${APP_NAME}</string>
	<key>CFBundleIconFile</key>
	<string>AppIcon</string>
	<key>CFBundleIdentifier</key>
	<string>${HOST_BUNDLE_ID}</string>
	<key>CFBundleInfoDictionaryVersion</key>
	<string>6.0</string>
	<key>CFBundleName</key>
	<string>${APP_NAME}</string>
	<key>CFBundlePackageType</key>
	<string>APPL</string>
	<key>CFBundleShortVersionString</key>
	<string>1.2.0</string>
	<key>CFBundleVersion</key>
	<string>1.2.0</string>
	<key>LSMinimumSystemVersion</key>
	<string>13.0</string>
</dict>
</plist>
PLIST_HOST

cat << PLIST_EXT > "${APPEX_DIR}/Contents/Info.plist"
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>CFBundleDevelopmentRegion</key>
	<string>tr</string>
	<key>CFBundleDisplayName</key>
	<string>${APP_NAME}</string>
	<key>CFBundleExecutable</key>
	<string>${APP_NAME} Extension</string>
	<key>CFBundleIconFile</key>
	<string>AppIcon</string>
	<key>CFBundleIdentifier</key>
	<string>${EXT_BUNDLE_ID}</string>
	<key>CFBundleInfoDictionaryVersion</key>
	<string>6.0</string>
	<key>CFBundleName</key>
	<string>${APP_NAME} Extension</string>
	<key>CFBundlePackageType</key>
	<string>XPC!</string>
	<key>CFBundleShortVersionString</key>
	<string>1.2.0</string>
	<key>CFBundleVersion</key>
	<string>1.2.0</string>
	<key>LSMinimumSystemVersion</key>
	<string>13.0</string>
	<key>NSExtension</key>
	<dict>
		<key>NSExtensionPointIdentifier</key>
		<string>com.apple.Safari.web-extension</string>
		<key>NSExtensionPrincipalClass</key>
		<string>SafariWebExtensionHandler</string>
	</dict>
</dict>
</plist>
PLIST_EXT

echo "7. Entitlements ve Kod Imzalama yapiliyor..."
cat << 'ENT_APPEX' > "${BUILD_DIR}/appex.entitlements"
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "https://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.security.app-sandbox</key>
    <true/>
</dict>
</plist>
ENT_APPEX

cat << 'ENT_HOST' > "${BUILD_DIR}/host.entitlements"
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "https://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.security.app-sandbox</key>
    <false/>
</dict>
</plist>
ENT_HOST

codesign --force --sign - --entitlements "${BUILD_DIR}/appex.entitlements" --timestamp=none "${APPEX_DIR}"
codesign --force --sign - --entitlements "${BUILD_DIR}/host.entitlements" --timestamp=none "${APP_DIR}"

echo "Derleme basariyla tamamlandi: ${APP_DIR}"
