package {
    import flash.display.*;
    import flash.events.*;
    import flash.system.*;
    import flash.text.*;
    import flash.utils.*;
    import flash.net.SharedObject;
    import flash.ui.Multitouch;
    import flash.ui.MultitouchInputMode;

    [SWF(width="950", height="700", frameRate="60", backgroundColor="#123222")]
    public class MobileLauncher extends Sprite {
        [Embed(source="../private/game.swf", mimeType="application/octet-stream")]
        private static const GameBytes:Class;
        private var game:Loader = new Loader();
        private var ui:Sprite = new Sprite();
        private var controls:Sprite = new Sprite();
        private var held:Object = {};
        private var prefs:SharedObject;
        private var widthFactor:Number = 1;
        private var status:TextField = new TextField();

        public function MobileLauncher() {
            if (stage) start(); else addEventListener(Event.ADDED_TO_STAGE, start);
        }
        private function start(event:Event=null):void {
            removeEventListener(Event.ADDED_TO_STAGE, start);
            stage.scaleMode = StageScaleMode.NO_SCALE;
            stage.align = StageAlign.TOP_LEFT;
            Multitouch.inputMode = MultitouchInputMode.TOUCH_POINT;
            try { prefs = SharedObject.getLocal("hhrMobileAir"); widthFactor = Number(prefs.data.widthFactor) || 1; } catch (e:Error) {}
            widthFactor = Math.max(.5, Math.min(1.5, widthFactor));
            addChild(game); addChild(ui);
            status.defaultTextFormat = new TextFormat("_sans", 20, 0xffffff);
            status.width = 700; status.height = 100; status.text = "Loading Helmet Heroes…"; ui.addChild(status);
            game.contentLoaderInfo.addEventListener(Event.COMPLETE, loaded);
            game.contentLoaderInfo.addEventListener(IOErrorEvent.IO_ERROR, failed);
            var context:LoaderContext = new LoaderContext(false, new ApplicationDomain(ApplicationDomain.currentDomain));
            context.allowCodeImport = true;
            game.loadBytes(new GameBytes() as ByteArray, context);
            stage.addEventListener(Event.RESIZE, layout);
            stage.addEventListener(Event.DEACTIVATE, releaseAll);
        }
        private function loaded(event:Event):void {
            ui.removeChild(status);
            ui.addChild(controls); controls.visible = false;
            var toggle:Sprite = button("Show controls", 150, 42);
            ui.addChild(toggle); toggle.x = 12; toggle.y = 8;
            toggle.addEventListener(MouseEvent.CLICK, function(e:MouseEvent):void {
                releaseAll(); controls.visible = !controls.visible;
                TextField(toggle.getChildAt(0)).text = controls.visible ? "Hide controls" : "Show controls";
            });
            layout();
        }
        private function failed(event:IOErrorEvent):void { status.text = "Game failed to load: " + event.text; }
        private function button(label:String, w:Number=74, h:Number=62):Sprite {
            var b:Sprite = new Sprite();
            b.graphics.beginFill(0x398c29, .85); b.graphics.lineStyle(2, 0x9ad66e);
            b.graphics.drawRoundRect(0, 0, w, h, 20); b.graphics.endFill();
            var t:TextField = new TextField(); t.defaultTextFormat = new TextFormat("_sans", 15, 0xffffff, true, null, null, null, null, "center");
            t.text = label; t.width = w; t.height = h; t.y = h/2 - 12; t.mouseEnabled = false; b.addChild(t);
            return b;
        }
        private function keyButton(label:String, code:uint, x:Number, y:Number):void {
            var b:Sprite = button(label); b.x=x; b.y=y; controls.addChild(b);
            b.addEventListener(TouchEvent.TOUCH_BEGIN, function(e:TouchEvent):void {
                if (held[e.touchPointID] !== undefined) return;
                held[e.touchPointID] = code; sendKey(code, true);
            });
        }
        private function sendKey(code:uint, down:Boolean):void {
            stage.dispatchEvent(new KeyboardEvent(down ? KeyboardEvent.KEY_DOWN : KeyboardEvent.KEY_UP, true, false, 0, code));
        }
        private function releaseTouch(event:TouchEvent):void {
            var code:* = held[event.touchPointID];
            if (code === undefined) return;
            delete held[event.touchPointID];
            for each (var other:uint in held) if (other == code) return;
            sendKey(uint(code), false);
        }
        private function releaseAll(event:Event=null):void {
            for each (var code:uint in held) sendKey(code, false);
            held = {};
        }
        private function layout(event:Event=null):void {
            releaseAll();
            // The game may manage its own Stage3D viewport; device testing is required.
            var scale:Number = Math.min(stage.stageWidth/950, stage.stageHeight/700);
            game.scaleX = scale * widthFactor; game.scaleY = scale;
            game.x = (stage.stageWidth - 950*game.scaleX)/2;
            game.y = (stage.stageHeight - 700*game.scaleY)/2;
            while (controls.numChildren) controls.removeChildAt(0);
            var bottom:Number = stage.stageHeight-76;
            keyButton("◀", 37, 12, bottom); keyButton("▶", 39, 164, bottom);
            keyButton("▲", 38, 88, bottom-68); keyButton("▼", 40, 88, bottom);
            keyButton("BLOCK", 83, stage.stageWidth-240, bottom-68);
            keyButton("JUMP", 32, stage.stageWidth-164, bottom);
            keyButton("ATTACK", 65, stage.stageWidth-88, bottom);
            var narrower:Sprite = button("Width −", 90, 42), wider:Sprite = button("Width +", 90, 42);
            narrower.x=stage.stageWidth-194; wider.x=stage.stageWidth-98; narrower.y=wider.y=8;
            controls.addChild(narrower); controls.addChild(wider);
            narrower.addEventListener(MouseEvent.CLICK, function(e:MouseEvent):void { changeWidth(-.05); });
            wider.addEventListener(MouseEvent.CLICK, function(e:MouseEvent):void { changeWidth(.05); });
            stage.removeEventListener(TouchEvent.TOUCH_END, releaseTouch);
            stage.addEventListener(TouchEvent.TOUCH_END, releaseTouch);
        }
        private function changeWidth(delta:Number):void {
            widthFactor=Math.max(.5, Math.min(1.5,widthFactor+delta));
            try { prefs.data.widthFactor=widthFactor; prefs.flush(); } catch (e:Error) {}
            layout();
        }
    }
}
