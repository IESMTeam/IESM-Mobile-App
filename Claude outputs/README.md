# IESM 3D

How a model moves through here:
1. Drop the raw GLB from SolidWorks in **Inbox** (add a photo of the real finish and a note on what moves: pivots, angles, timing).
2. Claude makes **Projects/<Model>/** with source, work (.blend), textures, export, renders.
3. Once approved, the final GLB (Android/web) + USDZ (iPhone AR) are copied to **Published**. Apps and the website only use files from Published.

- **_Library/Materials** - IESM finishes as Blender assets, plus reference photos of each real finish.
- **_Library/Scenes** - IESM_Shop.blend, the realistic shop for renders.
- **_Library/Parts** - reusable rigged parts (cylinders, bearings) so motion is set up once.
- **_Pipeline** - the scripts and settings.json (standard sizes, finishes, export rules).

To see the materials in your Blender: Edit > Preferences > File Paths > Asset Libraries > add this folder's **_Library**. They show under IESM > Materials in the Asset Browser.

Rendering on your PC: open a project's *_render_shop.blend, set Render > Device to GPU, then Render > Render Animation.
