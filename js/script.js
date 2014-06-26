(function(){

    function Game(player){
        this.canvasWidth = window.innerWidth
        , this.canvasHeight = window.innerHeight
        , this.aspectRatio = canvasWidth / canvasHeight
        , this.viewSize = 1000
        , this.leftStick
        , this.rightStick
        , this.football
        , this.scene = new THREE.Scene()
        , this.camera
        , this.renderer = new THREE.WebGLRenderer({ alpha: true })
        , this.clock = new THREE.Clock()
        , this.keyboard = new KeyboardState()
        , this.ambient = new THREE.AmbientLight( 0x101030 )
        , this.directionalLight = new THREE.DirectionalLight( 0xffeedd )
        , this.ground;

        this.init = init;
    }

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
    , collidableMeshList = [];
    var rightStickDirY = 0, paddleSpeed = 10;
    var ballDirX = 1, ballDirY = 1, ballSpeed = 5;
    var myScore = 0, opponentScore = 0;

    init();

    function init(){

        // test camera
        /*
        camera = new THREE.PerspectiveCamera(90, window.innerWidth/window.innerHeight, 1, 2000)
        camera.position.set(-750, -950, 100);
        camera.rotation.x = Math.PI / 2;
        */
        
        //main camera

        camera = new THREE.OrthographicCamera( -aspectRatio * viewSize / 2, aspectRatio * viewSize / 2, viewSize / 2, -viewSize / 2, -2000, 2000 );
        camera.position.set(0, 0, 250);
        //camera.rotation.x = Math.PI / 2;
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
    }

    loadModels();

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

        var handGeometry = new THREE.CylinderGeometry( 14, 12, 600, 32 );
        var handMaterial = new THREE.MeshBasicMaterial( {color: 0xff0f00} );
        var hands = new THREE.Mesh( handGeometry, handMaterial );
        hands.position.set(0, 0, 0);

        var headGeometry = new THREE.SphereGeometry( 16, 32, 32 );
        var headMaterial = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
        var head = new THREE.Mesh( headGeometry, headMaterial );
        head.position.set(0, 0, 10);

        var torsoGeometry = new THREE.CubeGeometry( 10, 25, 60 );
        var torsoMaterial = new THREE.MeshBasicMaterial( {color: 0x0000ff} );
        var torso = new THREE.Mesh( torsoGeometry, torsoMaterial );
        torso.position.set(0, 0, -20);

        leftStick = new THREE.Object3D();
        leftStick.add(hands);
        leftStick.add(head);
        leftStick.add(torso);
        leftStick.position.set(-800, 0, 80);
        leftStick.name = "left-stick";
        scene.add(leftStick);

        //collidableMeshList.push(leftStick);

        rightStick = new THREE.Object3D();
        rightStick.add(hands.clone());
        rightStick.add(head.clone());
        rightStick.add(torso.clone());
        rightStick.position.set(800, 0, 80);
        rightStick.name = "right-stick";
        scene.add(rightStick);

        var footballMaterial = new THREE.MeshLambertMaterial({
            map: THREE.ImageUtils.loadTexture('css/images/football-texture.jpg')
        });
        football = new THREE.Mesh(new THREE.SphereGeometry(30, 100, 100), footballMaterial);
        football.overdraw = true;
        football.position.set(0, 0, 28);
        scene.add(football);

        goal1 =new THREE.Mesh(new THREE.CubeGeometry(30, 10, 150), new THREE.MeshNormalMaterial());
        goal1.overdraw = true;
        goal1.position.set(-900, 0, 0);
        goal1.rotation.x = Math.PI / 2;
        goal1.name = "goal1";
        scene.add(goal1);
        collidableMeshList.push(goal1);

        goal2 = goal1.clone();
        goal2.overdraw = true;
        goal2.position.set(900, 0, 0);
        goal2.rotation.x = Math.PI / 2;
        goal2.name = "goal2";
        scene.add(goal2);
        collidableMeshList.push(goal2);
        
    }
    

    function render() {
        var timer = Date.now() * 0.05;

        football.position.x -= 1;
        
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
            leftStick.rotation.y += 0.3;
            //leftStick.rotateOnAxis(leftStickAxis, 0);
        }
        if(keyboard.pressed("left")){
            leftStick.rotation.y -= 0.3;
        }

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
                console.log("collided " + collisions[0].object.name);
            }
        }
    }



    function ballPhysics(){
    if (football.position.x <= -900){   
        if (football.position.y <=150 && football.position.y >= -150){
     
        opponentScore++;
        scoreCard(myScore, opponentScore);
        //console.log("I loose");
        // document.getElementById("scores").innerHTML = score1 + "-" + score2;
        // resetBall(2);
        // matchScoreCheck();  
        }
        ballDirX = -ballDirX;
    }
    
    else if (football.position.x >= 900){
        if (football.position.y <= 150 && football.position.z >= -150)
        {   
      
        myScore++;  
        scoreCard(myScore, opponentScore);
        // document.getElementById("scores").innerHTML = score1 + "-" + score2;
        // resetBall(1);
        // matchScoreCheck();  
        }
    ballDirX = -ballDirX;
    }
    else if (football.position.y <= -400)
    {
        ballDirY = -ballDirY;
    }   
    // if ball goes off the bottom side (side of table)
    else if (football.position.y >= 400)
    {
        ballDirY = -ballDirY;
    }

    // update ball position over time
    football.position.x += ballDirX * ballSpeed;
    football.position.y += ballDirY * ballSpeed;
    
    // limit ball's y-speed to 2x the x-speed
    // this is so the ball doesn't speed from left to right super fast
    // keeps game playable for humans
    if (ballDirY > ballSpeed * 2)
    {
        ballDirY = ballSpeed * 2;
    }
    else if (ballDirY < -ballSpeed * 2)
    {
        ballDirY = -ballSpeed * 2;
    }
}

function opponentPaddleMovement()
{

    //leftStick.children[2]
    // Lerp towards the ball on the y plane
    rightStickDirY = (football.position.y - rightStick.position.y);
    
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





    function animate() {
        renderer.render(scene, camera);
        requestAnimationFrame( animate );
        ballPhysics();        
        update();
        opponentPaddleMovement();
    }

    animate();
})();