import {SlimegCharacterSprite} from './SlimegCharacterSprite';

export class DamageController {
    character: SlimegCharacterSprite = null;
    invinsible: boolean = false;

    timer = undefined;

    blinkTween = undefined;

    constructor(character: SlimegCharacterSprite) {
        this.character = character;
    }

    addDamage(amount: number) {
        if (this.invinsible) {
            return;
        }
        
        this.character.health -= amount;
       
        if(this.character.health <= 0) {
            this.character.health = 0;
            this.character.blinkTween.stop();
            return;
        }
        
        this.character.blinkTween.play();
        this.character.body.setVelocityY(-70);
        this.invinsible = true;

        this.timer = setTimeout(()=> {
           this.invinsible = false; 
        }, 1000);
    }
}
