import { scaleFactor } from "./constants";
import { k } from "./kaboomContext";
import { displayDialogue } from "./utils";

k.loadSprite("spritesheet", "./spritesheet.png", {
    sliceX: 39, 
    sliceY: 31,
    anims: {
        "idle-down": 936,
        "walk-down": { from: 936, to: 939, loop: true, speed: 8 },
        "idle-side": 975,
        "walk-side": { from: 975, to: 978, loop: true, speed: 8 },
        "idle-up": 1014,
        "walk-up": { from: 1014, to: 1017, loop: true, speed: 8 },
      },
});

k.loadSprite("map", "./map.png");

k.setBackground(k.Color.fromHex("#311047"));

k.scene("main", async () =>{
  //logic for scene
  const mapData = await (await fetch ("./map.json")).json(); //await allows for the image to load up before doing anything else
  const layers = mapData.layers;
  const map = k.add([k.sprite("map"), //calls map created with .loadSprite
                      k.pos(0),
                      k.scale(scaleFactor)]); //make function creates the object but it does not displays it yet, the add function adds it to the scene
  
  const player = k.add([k.sprite("spritesheet", {anim: "idle-down"}),
                         k.area({shape: new k.Rect(k.vec2(0, 3), 10, 10)}),
                         k.body(),
                         k.anchor("center"),
                         k.pos(),
                         k.scale(scaleFactor),
                         {
                          speed: 250,
                          direction: "down"
                          //isInDialogue: false,
                         },
                         "player"
                      ]);

  for (const layer of layers){
    if (layer.name === "boundaries"){
      for (const boundary of layer.objects) {
        map.add([
          k.area({shape: new k.Rect(k.vec2(0), boundary.width, boundary.height),}),
          k.body({ isStatic: true }), //so the player wont be able to overlap with boundaries
          k.pos(boundary.x, boundary.y),
          boundary.name,
        ]);
        
        if (boundary.name){
          player.onCollide(boundary.name, () =>{
            player.isInDialogue = true;
            displayDialogue("Test", () => (player.isInDialogue = false));

          });
        }
      }
      continue;
    }
    if (layer.name === "spawnpoints"){
      for (const entity of layer.objects){
        if (entity.name === "player") {
          player.pos = k.vec2(
          (map.pos.x + entity.x) * scaleFactor,
          (map.pos.y + entity.y) * scaleFactor
        );

        k.add(player);
        continue;
       }
     }
  }
 }

 k.onUpdate(() =>{
  k.camPos(player.pos.x, player.pos.y + 100)
 })
});

k.go("main"); //go is to define the default scene