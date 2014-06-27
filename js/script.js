var canvasWidth = window.innerWidth
, canvasHeight = window.innerHeight
, aspectRatio = canvasWidth / canvasHeight
, viewSize = 1000
, leftStick
, rightStick
, football
, scene = new THREE.Scene()
, camera
, renderer = new THREE.WebGLRenderer({ alpha: true })
, clock = new THREE.Clock()
, keyboard = new KeyboardState()
, ambient = new THREE.AmbientLight( 0x101030 )
, directionalLight = new THREE.DirectionalLight( 0xffeedd )
, ground
, collidableMeshList = []
, rightStickDirY = 0
, paddleSpeed = 0
, ballDirX = 1
, ballDirY = 1
, ballSpeed = 3
, difficulty = 0.2
, myScore = 0
, opponentScore = 0
, isGameOver = true
, isGoalScored = false;

level(level);

function level(level)
{
    if level == 0{
        paddleSpeed = 5;
    }
    else{
        paddleSpeed = 10;
    }
}

function init(){

    // test camera
    
    // camera = new THREE.PerspectiveCamera(90, window.innerWidth/window.innerHeight, 1, 2000)
    // camera.position.set(-750, 350, 10);
    // camera.rotation.x = Math.PI / 2;
    // camera.rotation.y = -Math.PI/2;
    

    
    camera = new THREE.OrthographicCamera( -aspectRatio * viewSize / 2, aspectRatio * viewSize / 2, viewSize / 2, -viewSize / 2, -2000, 2000 );
    camera.position.set(0, 0, 250);
    camera.rotation.x = Math.PI / 2;
    camera.lookAt(new THREE.Vector3(0, 50, 0));
    

    renderer.setClearColor( 0x000000, 0 );
    renderer.setSize(window.innerWidth, window.innerHeight);

    document.body.appendChild(renderer.domElement);
    
    scene.add( ambient );
    
    directionalLight.position.set( 2, 0, 1 );
    scene.add( directionalLight );

    var groundMaterial = new THREE.MeshLambertMaterial({
        map: THREE.ImageUtils.loadTexture('css/images/grass-texture.png')
    });


    ground = new THREE.Mesh(new THREE.PlaneGeometry(window.innerWidth, window.innerHeight), groundMaterial);
    ground.position.set(0, 0, 0);
    //ground.rotation.x = Math.PI / 2;
    //ground.overdraw = true;
    scene.add(ground);

 
    /*
    // Grid
    var size = 700, step = 100;
    var geometry = new THREE.Geometry();
    for ( var i = - size; i <= size; i += step ) {
        geometry.vertices.push( new THREE.Vector3( - size, 0, i ) );
        geometry.vertices.push( new THREE.Vector3(   size, 0, i ) );
        geometry.vertices.push( new THREE.Vector3( i, 0, - size ) );
        geometry.vertices.push( new THREE.Vector3( i, 0,   size ) );
    }

    var material = new THREE.LineBasicMaterial( { color: 0x000000, opacity: 0.2 } );
    var line = new THREE.Line( geometry, material );
    line.type = THREE.LinePieces;
    line.rotation.x = Math.PI / 2;
    //scene.add(line);
    */

    loadModels();
}

//loadModels();

function loadModels(){
    var manager = new THREE.LoadingManager();
    manager.onProgress = function ( item, loaded, total ) {
        //console.log( item, loaded, total );
    };

    /*
    var texture = new THREE.Texture();

    var loader = new THREE.ImageLoader(manager);
    loader.load('models/UV_Grid_Sm.jpg', function(image){

        texture.image = image;
        texture.needsUpdate = true;

    }); 
    
    */

    leftStick = createPlayer("left-stick", -400, 0xAA3939);        
    scene.add(leftStick);
    leftStick.children[2].name = "my stick";
    collidableMeshList.push(leftStick.children[2]);

    rightStick = createPlayer("right-stick", 400, 0x4B5AB4);
    scene.add(rightStick);
    rightStick.children[2].name = "not my stick";
    collidableMeshList.push(rightStick.children[2]);


    var footballMaterial = new THREE.MeshLambertMaterial({
        map: THREE.ImageUtils.loadTexture('css/images/football-texture.jpg')
    });
    football = new THREE.Mesh(new THREE.SphereGeometry(30, 100, 100), footballMaterial);
    football.overdraw = true;
    football.position.set(0, 0, 30);
    scene.add(football);

    goal1 =new THREE.Mesh(new THREE.CubeGeometry(30, 10, 150), new THREE.MeshNormalMaterial());
    goal1.overdraw = true;
    goal1.position.set(-600, 0, 0);
    goal1.rotation.x = Math.PI / 2;
    goal1.name = "goal1";
    goal1.type = 0;
    scene.add(goal1);
    collidableMeshList.push(goal1);

    goal2 = goal1.clone();
    goal2.overdraw = true;
    goal2.position.set(600, 0, 0);
    goal2.rotation.x = Math.PI / 2;
    goal2.name = "goal2";
    goal2.type = 2;
    scene.add(goal2);
    collidableMeshList.push(goal2);

    //adding invisible walls around

    var wallGeometry = new THREE.CubeGeometry( 1250, 10, 200, 1, 1, 1 );
    var wallMaterial = new THREE.MeshBasicMaterial({ transparent : true, opacity: 0 });
    var wall = new THREE.Mesh(wallGeometry, wallMaterial);

    var wall2 = wall.clone();
    var wall3 = wall.clone();
    var wall4 = wall.clone();

    wall.position.set(0, -350, 50);
    wall2.position.set(0, 330, 50);

    wall3.position.set(650, -200, 50);
    wall3.rotation.z = Math.PI / 2;
    wall4.position.set(-650, -200, 50);
    wall4.rotation.z = Math.PI / 2;

    scene.add(wall);
    scene.add(wall2);
    scene.add(wall3);
    scene.add(wall4);

    wall.type = 1;
    wall2.type = 1;
    wall3.type = 1;
    wall4.type = 1;

    collidableMeshList.push(wall);
    collidableMeshList.push(wall2);
    collidableMeshList.push(wall3);
    collidableMeshList.push(wall4);


    setTimeout(function  () {
        isGameOver = false;
        timer(300000);
    }, 4000);
    


    animate();
    
}

function createPlayer(name, position, color){

    var handTexture = new THREE.MeshLambertMaterial({
        map: THREE.ImageUtils.loadTexture('css/images/steel-texture.jpg')
    });
    var handGeometry = new THREE.CylinderGeometry( 14, 12, 600, 32 );
    var hands = new THREE.Mesh( handGeometry, handTexture );
    hands.position.set(0, 0, 0);

    var headGeometry = new THREE.SphereGeometry( 18, 32, 32 );
    var headMaterial = new THREE.MeshBasicMaterial( {color: color } );
    var head = new THREE.Mesh( headGeometry, headMaterial );
    head.position.set(0, 0, 26);

    var torsoGeometry = new THREE.CubeGeometry( 15, 70, 80 );
    var torsoMaterial = new THREE.MeshBasicMaterial( {color: color} );
    var torso = new THREE.Mesh( torsoGeometry, torsoMaterial );
    torso.position.set(0, 0, -50);

    var player = new THREE.Object3D();
    player.add(hands);
    player.add(head);
    player.add(torso);
    player.position.set(position, 0, 80);
    player.name = name;

    return player;
}


function render() {
    var timer = Date.now() * 0.05;

    //football.position.x -= 1;
    
    renderer.render(scene, camera);
}

function update() {

    /* keyboard stuff */

    keyboard.update();

    var moveDistance = 5 * clock.getDelta(); 

    if(keyboard.pressed("up")){
        leftStick.translateY( 10 );
    }

    if(keyboard.pressed("down")){
        leftStick.translateY( -10 );
    }

    if(keyboard.pressed("right")){
        leftStick.rotation.y += 0.5;
        //leftStick.rotateOnAxis(leftStickAxis, 0);
    }
    if(keyboard.pressed("left")){
        leftStick.rotation.y -= 0.5;
    }

    ballSpeed += (3 - ballSpeed) * 0.005;

    var rays = [
        new THREE.Vector3(0, 0, 1),
        new THREE.Vector3(1, 0, 1),
        new THREE.Vector3(1, 0, 0),
        new THREE.Vector3(1, 0, -1),
        new THREE.Vector3(0, 0, -1),
        new THREE.Vector3(-1, 0, -1),
        new THREE.Vector3(-1, 0, 0),
        new THREE.Vector3(-1, 0, 1)
    ];

    var caster = new THREE.Raycaster()
    , collisions
    , distance = 50;

    for (i = 0; i < rays.length; i += 1) {
        caster.set(football.position, rays[i]);
        collisions = caster.intersectObjects(collidableMeshList);
        if (collisions.length > 0 && collisions[0].distance <= distance) {
            if( collisions[0].object.type == 0 ){
                opponentScore++;
                isGoalScored = true;
                resetBall("opponent");
                scoreCard(myScore, opponentScore);
            }
            else if (collisions[0].object.type == 2 ){
                myScore++;
                resetBall("player");
                isGoalScored = true;
                scoreCard(myScore, opponentScore);
            }

            //console.log("collided " + collisions[0].object.name);
            ballDirX = -ballDirX;
            ballSpeed =8;
        }
    }
}

function resetBall(winner)
{

    var tempTimer = setTimeout(function () {
        console.log('will call goalScored fn');
        goalScored(winner);
        clearTimeout(tempTimer);
    }, 2000);
    
}
function goalScored(winner) {
    ballSpeed = 1.5;
    
    // if player lost the last point, we send the ball to opponent
    if (winner == "player")
    {
        football.position.x = -300;
        football.position.y = 0;
        ballDirX = -1;
    }
    // else if opponent lost, we send ball to player
    else
    {
        football.position.x = 300;
        football.position.y = 0;
        ballDirX = -1;
    }
    
    // set the ball to move +ve in y plane (towards left from the camera)
    ballDirY = 1;
    isGoalScored = false;
}


function ballPhysics() {


    if (football.position.x <= -600) {
        if (football.position.z <= 75 && football.position.z >= -75){

            //opponentScore++;
            //resetBall("opponent");
            //console.log('will update opponent score ' + opponentScore);
            //scoreCard(myScore, opponentScore);
            //console.log("I loose");
            // document.getElementById("scores").innerHTML = score1 + "-" + score2;
            // resetBall(2);
            // matchScoreCheck();  
        }
        ballDirX = -ballDirX;
    } else if (football.position.x >= 600) {
        if (football.position.z <= 75 && football.position.z >= -75) {

            //myScore++;
            //resetBall("player");
            //scoreCard(myScore, opponentScore);
            // document.getElementById("scores").innerHTML = score1 + "-" + score2;
            // resetBall(1);
            // matchScoreCheck();  
        }
        ballDirX = -ballDirX;
    } else if (football.position.y <= -400) {
        ballDirY = -ballDirY;
    }
    // if ball goes off the bottom side (side of table)
    else if (football.position.y >= 400) {
        ballDirY = -ballDirY;
    }

    // update ball position over time
    football.position.x += ballDirX * ballSpeed;
    football.position.y += ballDirY * ballSpeed;

    // limit ball's y-speed to 2x the x-speed
    // this is so the ball doesn't speed from left to right super fast
    // keeps game playable for humans
    if (ballDirY > ballSpeed * 2) {
        ballDirY = ballSpeed * 2;
    } else if (ballDirY < -ballSpeed * 2) {
        ballDirY = -ballSpeed * 2;
    }
}

function opponentPaddleMovement(){

    //leftStick.children[2]
    // Lerp towards the ball on the y plane
    rightStickDirY = (football.position.y - rightStick.position.y)
    
    // in case the Lerp function produces a value above max paddle speed, we clamp it
    if (Math.abs(rightStickDirY) <= paddleSpeed)
    {   
        rightStick.position.y += rightStickDirY;
    }
    // if the lerp value is too high, we have to limit speed to paddleSpeed
    else
    {
        // if paddle is lerping in +ve direction
        if (rightStickDirY > paddleSpeed)
        {
            rightStick.position.y += paddleSpeed;
        }
        // if paddle is lerping in -ve direction
        else if (rightStickDirY < -paddleSpeed)
        {
            rightStick.position.y -= paddleSpeed;
        }
    }
}

function resetPositions () {
    football.position.set(0, 0, 0);
    rightStick.position.set(400, 0, 80);
    leftStick.position.set(-400, 0, 80);
}

function animate() {
    renderer.render(scene, camera);
    requestAnimationFrame( animate );
    if (!isGameOver){
        if(!isGoalScored){
              ballPhysics();
              update();

        }
         
            opponentPaddleMovement();
    
    }else{
        resetPositions();
    }
}

function onWindowResize(){

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}



window.addEventListener('resize', onWindowResize);
