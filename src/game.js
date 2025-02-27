import Map from "./map.js"
import CollisionDetector from "./collision_detector.js"
import Camera from "./camera.js"
import TileRegistry from "./tile_registry.js"
import { MoneySystem } from "./game_objects.js";
import { HealthBar } from "./game_objects.js";



/**
 * Diese Klasse enthält die globalen Variablen für das Spiel,
 * sowie das GameLoop, welches das Spiel zeichnen soll.
 */
export default class Game {

  static map = null;
  static player = null;
  static enemy = null;
  static money = null;
  static health = null;
  static Enemyhealth = null;
  static running = false;
  static worldNumber = 1
  static currentFrame = 0

  constructor() {
    this.tileSize = 35
    this.canvas = document.querySelector("#canvas")
    this.canvas.width = 35 * this.tileSize
    this.canvas.height = 15 * this.tileSize
    this.ctx = this.canvas.getContext("2d")
    this.ctx.imageSmoothingEnabled = false

    Game.money = new MoneySystem(100)
    Game.health = new HealthBar(100)


    Game.loadMap("maps/map-01.txt")

    this.camera = new Camera(this)

    Game.running = false
    window.requestAnimationFrame(this.gameLoop.bind(this))
  }

  /**
   * Startet das Spiel.
   * 
   * Das Spiel wird gestartet indem die Animationsschleife
   * des Spiels aufgerufen wird.
   */
  static start() {
    Game.running = true
  }

  /**
   * Pausiert das Spiel.
   * 
   * Die Animationsschleife des Spiels wird unterbrochen,
   * dadurch wird das Spiel pausiert.
   * 
   * Um das Spiel weiterlaufen zu lassen, muss die Methode 
   * `start()` aufgerufen werden.
   */
  static pause() {
    Game.running = false
  }

  static loadMap(mapfile) {
      TileRegistry.clear()
      CollisionDetector.clear()
      Game.player = null
      Game.map = new Map(mapfile)

  }

  /**
   * Berechnet jeweils das nächste Frame für das Spiel.
   * Die Positionen der Spiel-Objekte werden neu berechnet,
   * die Kamera wird korrekt ausgerichtet und die 
   * Spiel-Objekte werden neu gezeichnet.
   */
  gameLoop() {
    

    Game.currentFrame++

    this.camera.clearScreen()
    this.camera.nextFrame()

    TileRegistry.updateAllTiles()
    CollisionDetector.checkCollision("all")

    this.camera.centerObject(Game.player)

    TileRegistry.drawAllTiles(this.ctx)

    if (Game.running === true) {
      window.requestAnimationFrame(this.gameLoop.bind(this))
    }
  }
}



