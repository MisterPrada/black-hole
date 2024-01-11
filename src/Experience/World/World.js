import Experience from '../Experience.js'
import Environment from './Environment.js'
import HellPortal from "./HellPortal.js";
import BlackHole from "./BlackHole.js";

export default class World
{
    constructor()
    {
        this.experience = new Experience()
        this.camera = this.experience.camera;
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.html = this.experience.html
        this.sound = this.experience.sound
        this.debug = this.experience.debug.panel

        // this.experience.time.start = Date.now()
        // this.experience.time.elapsed = 0

        // Wait for resources
        this.resources.on('ready', () =>
        {
            this.experience.time.start = Date.now()
            this.experience.time.elapsed = 0

            //this.hellPortal = new HellPortal()
            this.blackHole = new BlackHole()

            // Setup
            this.environment = new Environment()

            // Remove preloader
            this.html.preloader.classList.add("preloaded");
            this.html.preloader.remove();
            this.html.playButton.remove();

            // Animation timeline
            this.animationPipeline();
        })

    }

    animationPipeline() {
        // if ( this.text )
        //     this.text.animateTextShow()

        if ( this.camera )
            this.camera.animateCameraPosition()
    }

    resize() {
        if(this.blackHole)
            this.blackHole.resize()
    }

    update()
    {
        if(this.hellPortal)
            this.hellPortal.update()

        if(this.blackHole)
            this.blackHole.update()
    }
}
