package com.mobilehelmethheroes.app;

import android.app.Activity;
import android.os.Bundle;
import android.view.View;
import android.webkit.*;
import android.net.Uri;
import java.io.*;

public class MainActivity extends Activity {
    private WebView game;
    private String overlay;
    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().addFlags(128);
        getWindow().getDecorView().setSystemUiVisibility(5894 | 1024 | 512);
        game = new WebView(this);
        setContentView(game);
        game.setBackgroundColor(0xff123222);
        game.getSettings().setJavaScriptEnabled(true);
        game.getSettings().setDomStorageEnabled(true);
        game.getSettings().setUseWideViewPort(true);
        game.getSettings().setLoadWithOverviewMode(true);
        game.getSettings().setAllowFileAccess(false);
        game.getSettings().setAllowContentAccess(false);
        try (InputStream stream = getAssets().open("overlay.js")) {
            ByteArrayOutputStream bytes = new ByteArrayOutputStream();
            byte[] buffer = new byte[4096]; int n;
            while ((n = stream.read(buffer)) > 0) bytes.write(buffer, 0, n);
            overlay = bytes.toString("UTF-8");
        } catch (IOException e) { throw new IllegalStateException(e); }
        game.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri u = request.getUrl();
                return !"https".equals(u.getScheme()) || !("hh-rewritten.com".equals(u.getHost()) || "www.hh-rewritten.com".equals(u.getHost()));
            }
            @Override public void onPageFinished(WebView view, String url) {
                if (url.startsWith("https://hh-rewritten.com/") || url.startsWith("https://www.hh-rewritten.com/")) view.evaluateJavascript(overlay, null);
            }
            @Override public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                if (request.isForMainFrame()) new android.app.AlertDialog.Builder(MainActivity.this)
                    .setTitle("Game unavailable").setMessage("Check your connection, then retry loading Helmet Heroes.")
                    .setPositiveButton("Retry", (dialog, which) -> game.loadUrl("https://hh-rewritten.com/play"))
                    .setNegativeButton("Close", (dialog, which) -> finish()).show();
            }
        });
        game.loadUrl("https://hh-rewritten.com/play");
    }
    @Override protected void onPause() { game.evaluateJavascript("window.dispatchEvent(new Event('blur'))", null); game.onPause(); super.onPause(); }
    @Override protected void onResume() { super.onResume(); if (game != null) game.onResume(); }
    @Override protected void onDestroy() { game.destroy(); super.onDestroy(); }
}
