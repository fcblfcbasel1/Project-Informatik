import EventHandler, {AnimationHandler, CollisionHandler, GravityHandler, HandlerManager} from "./event_handler.js"
import { findAndRemoveFromList } from "./utils.js"
import TileRegistry from "./tile_registry.js"
import CollisionDetector from "./collision_detector.js"


/**
 * Dies ist die Basisklasse für alle Spiel-Objekte.
 * 
 * Wenn ein spezialisiertes Spiel-Objekt erzeugt wird, dann soll es 
 * immer diese Klasse erweitern. Wenn die Funktionen von der Basisklasse
 * überschrieben werden, sollten diese immer zuerst mit `super.function()` 
 * aufgerufen werden, so das die eigentliche Funktionalität der Spiel-Objekte
 * erhalten bleibt.
 */
export class GameObject {
  constructor(x, y, options = {sheet, layer: "background", collisionTags: []}) {
    this.sheet = options.sheet
    this.tileSize = 32
    this.x = x * this.tileSize
    this.y = y * this.tileSize
    this.col = 0
    this.row = 0
    this.layer = options.layer
    this.handlers = new HandlerManager([])
    TileRegistry.layers[this.layer].push(this)
    this.collisionTags = options.collisionTags
    this.collisionTags.forEach(tag => {
      CollisionDetector.layers[tag].push(this)
    })
  }

  /**
   * Zeichnet das Spiel-Objekt auf das Canvas. Das Spiel-Objekt
   * kennt dabei seine Position und welches Bild gezeichnet werden soll.
   * @param {CanvasRenderingContext2D} ctx Das Canvas, worauf das Spiel-Objekt gezeichnet werden soll.
   */
  draw(ctx) {
    ctx.drawImage(
      this.sheet,
      this.col * this.tileSize, this.row * this.tileSize, this.tileSize, this.tileSize,
      this.x, this.y, this.tileSize, this.tileSize
    )
  }

  /**
   * Zerstört das Spiel-Objekt und entfernt es aus dem Spiel.
   */
  destroy() {
    findAndRemoveFromList(TileRegistry.layers[this.layer], this)
    this.collisionTags.forEach(tag => {
      findAndRemoveFromList(CollisionDetector.layers[tag], this)
    })
  }

  /**
   * Berechne die Position und andere Eigenschaften des 
   * Spiel-Objekts neu. Wie das gemacht wird, wird in den 
   * verschieden Handlers angegeben. Ein Spiel-Objekt kann
   * z.B. einen Gravitations-Handler haben, dieser fügt dann
   * Gravitation für dieses Spiel-Objekt hinzu und berechnet die 
   * y-Position des Spiel-Objekts neu.
   */
  update(){
    this.handlers && this.handlers.runAll(this)
  }


}

export class Background extends GameObject {
  constructor(x, y) {
    const ground = document.querySelector("#ground")
    super(x, y, {
      sheet: ground,
      layer: "background",
      collisionTags: []
    })

    this.row = 0
    this.col = 0
  }
}

export class Stone extends GameObject {
  constructor(x, y) {
    const ground = document.querySelector("#ground")
    super(x, y, {
      sheet: ground,
      layer: "world",
      collisionTags: ["world"]
    })
    this.row = 0
    this.col = 1
  }
}



export class Tree extends GameObject {
  constructor(x, y) {
    const ground = document.querySelector("#ground")
    super(x, y, {
      sheet: ground,
      layer: "world",
      collisionTags: ["world"]
    })
    this.row = 1
    this.col = 1
  }
}

export class Mushroom extends GameObject {
  constructor(x, y) {
    const ground = document.querySelector("#ground")
    super(x, y, {
      sheet: ground,
      layer: "item",
      collisionTags: ["pickups"]
    })
    this.row = 0
    this.col = 2
  }
}

class AnimatedGameObject extends GameObject {
  constructor(x, y, options) {
    super(x, y, options)
    this.frameCounter = 0
    this.dx = 0
    this.dy = 0
  }

  update() {
    super.update()
    this.x = this.x + this.dx
    this.y = this.y + this.dy
    this.dx = 0
    this.dy = 0
  }
}


export class Player extends AnimatedGameObject {
  constructor(x, y) {
    const img = document.querySelector("#character")
    super(x, y, {
      sheet: img,
      layer: "player",
      collisionTags: ["world", "pickups"]
    })
    this.row = 0
    this.col = 1
    this.speed = 15
    this.handlers = new HandlerManager([
      new EventHandler(),
      new CollisionHandler(),
      new AnimationHandler({ framesPerAnimation: 15, numberOfFrames: 3})
    ])
  }

  

  jump() {
    this.handlers.get(GravityHandler).jump(this)
  }

  update() {
    super.update()
  }

  handle(ev) {
    if (ev === "KeyW") { this.move("up") }
    if (ev === "KeyS") { this.move("down") }
    if (ev === "KeyA") { this.move("left") }
    if (ev === "KeyD") { this.move("right") }
    
  }

  move(direction) {
    if (direction === "up") {
      this.dy = this.dy + (-1) * this.speed
      this.row = 3
    } else if (direction === "down") {
      this.dy = this.dy + (1) * this.speed
      this.row = 0
    } else if (direction === "left") {
      this.dx = this.dx + (-1) * this.speed
      this.row = 1
    } else if (direction === "right") {
      this.dx = this.dx + (1) * this.speed
      this.row = 2
    }
  }
}

class playerattributes extends Player {
constructor(name, hp, dmg) {
  this.name = name

        this.statsHp = 20 + hp
        this.statsArmor = 8     
        this.statsDmg = 4 + dmg
        this.statsMana = 100
        
        this.target = null
        
        watchElement(this)
}

actionAttack() {
  if (this.target == null) {
      errorLog("Es ist kein Ziel definiert.")
  }
  let doDmg = this.statsDmg

  if(this.weapon) {
      doDmg = doDmg + this.weapon.dmg
      if(this.weapon.type === "axe") {
          doDmg = doDmg * 2
      }
      if(this.weapon.type === "sword") {
          doDmg = doDmg * 1.5
      }
      if(this.armor.type === "Helmet") {
          doDmg = doDmg * 0.5
      }
      if(this.armor.type === "Foot-Armor") {
          doDmg = doDmg * 0.75
      }
      if(this.armor.type === "Chest-Armor") {
          doDmg = doDmg *0.25
      }

  }
  this.target.takeDamage(doDmg)
}

actionHeal() {
  this.statsHp = this.statsHp + 100
}


actionDie() {
  this.statsHp = 0
}

takeDamage(dmg) {
  let takeDmg = dmg
  this.statsHp = this.statsHp - takeDmg
}

actionCastfireball() {
  if(this.statsMana >= 90){
  this.takeDamage(20)
  this.target.takeDamage(50)
  this.statsMana -= 90
  }
  else {
      this.takeDamage(10)
  }
}
}
