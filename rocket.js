var rocket = [];
var target;
var lp = 250;
var life = 0;
var gen = 1;
var closestDist;
var obsticles;

function setup() {
    createCanvas(800, 600)
    rocket = new Population(30);
    
    obsticles = createVector(width / 2, height / 2);

    target = createVector(width / 2,30);
    closestDist = dist(width / 2, height, target.x, target.y);
}

function draw() {
    background(37, 38, 39)
    textSize(32);
    fill(255)
    text(life, 60, 60);
    text("Generation "+gen,130,60);
    textSize(15);
    text("Best Score " + Math.floor(closestDist), 60, height - 30);
    rectMode(CENTER)
    rect(target.x,target.y, 50,50)
    rect(obsticles.x,obsticles.y,width / 2, 20)
    rocket.show();
    if((frameCount % lp) === 0){
       noLoop();
        rocket.evaluate();
       rocket.newGeneration();
       gen++;
       life = 0;
       loop();
    }else {
        life++
    }
}


class DNA {
    constructor(genes){
        if(genes){
            this.genes = genes
        }else{
            this.genes = [];
            for (let i = 0; i < lp; i++) {
                this.genes[i] = p5.Vector.random2D();
                this.genes[i].setMag(0.4);
            }
        }
    }

    crosover(dna){
        let midPoint = random(0,this.genes.length);
        let newGenes = [];
        for (let i = 0; i < this.genes.length; i++) {
           if(i < midPoint){
                newGenes[i] = this.genes[i];
           }else{
               newGenes[i] = dna.genes[i];
           }
        }

        return new DNA(newGenes);
    }

    mutate(){
        for (let i = 0; i < this.genes.length; i++) {
            if(random(1) > 0.99){
                this.genes[i] = p5.Vector.random2D();
                this.genes[i].setMag(random(0,1));
            }
        }
    }


}


class Population {
    constructor(size){
        this.species = [];
        for (let i = 0; i < size; i++) {
            this.species[i] = new Rocket(width / 2, height);
        }
    }
    
    show(){
        for (let i = 0; i < this.species.length; i++) {
            this.species[i].update();
            this.species[i].show();
        }
    }

    evaluate(){
        let maxScore = 0;
        for (let i = 0; i < this.species.length; i++) {
            this.species[i].calcFitnes();
            if(this.species[i].score > maxScore){
                maxScore = this.species[i].score
            }
            if (this.species[i].d < closestDist ){
                closestDist = this.species[i].d;
            }
        }
        
        for (let i = 0; i < this.species.length; i++) {
            
            this.species[i].score /= maxScore;
            
            if(this.species[i].finish){
                this.species[i].score = 2;
            }

            if(this.species[i].stuck){
                this.species[i].score = 0.0001;
            }
        }

    }

    newGeneration(){
        let meltingPot = [];
        for (let i = 0; i < this.species.length; i++) {
            
            let count = this.species[i].score * 100;
            // console.log(this.species[i].finish,count);
            for (let j = 0; j < count; j++) {
                meltingPot.push(this.species[i].dna);    
            }
        }

        let newSpecies = [];

        for (let i = 0; i < this.species.length; i++) {
            let parentA = random(meltingPot);
            let parentB = random(meltingPot);

            let child = parentA.crosover(parentB);
            child.mutate();

            
            newSpecies[i] = new Rocket(width / 2, height,child);
        }

        this.species = newSpecies;

    }
}



class Rocket {

    constructor(x, y,dna) {
        this.pos = createVector(x, y);
        this.vel = createVector();
        this.acc = createVector();
        this.finish = false;
        this.stuck = false;
        this.color = "rgba(255, 255, 255, 0.6)";
       if(dna){
           this.dna = dna;
       }else{
           this.dna = new DNA();
       }
        this.score = 0;
        this.d; 
    }

    show() {
        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.vel.heading());
        rectMode(CENTER);
        noStroke()
        fill(color(this.color))
        rect(0, 0, 40, 10);
        pop();
    }

    applyForce(force){
        this.acc.add(force);
    }

    calcFitnes(){
        let d = dist(this.pos.x,this.pos.y,target.x,target.y);
        this.d = d;
        this.score = map(d,0,width,width,0);
    }

    update() {
        this.applyForce(this.dna.genes[life])

        let d = dist(this.pos.x, this.pos.y, target.x, target.y);

        if(d < 25){
            this.finish = true;
            this.color = "rgba(73, 228, 194, 0.87)";
            return;
        }

        if ((this.pos.x < (obsticles.x + width / 4)) && (this.pos.x > (obsticles.x - width / 4)) && (this.pos.y < (obsticles.y + 10)) && (this.pos.y > (obsticles.y - 10)) ){
            this.stuck = true;
            this.color = "rgba(226, 12, 12, 0.87)";
            return
        }

       
        
        if((this.pos.x < 0) || (this.pos.x > width) ){
            this.stuck = true;
            this.color = "rgba(226, 12, 12, 0.87)";
            return
        }

        if ((this.pos.y < 0) || (this.pos.y > height)) {
            this.stuck = true;
            this.color = "rgba(226, 12, 12, 0.87)";            
            return
        }

        this.vel.add(this.acc);
        this.pos.add(this.vel);
        this.acc.mult(0);
    
    }
}