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
    var ballDirX = 1, ballDirY = 1, ballSpeed = 15;
    var myScore = 0, opponentScore = 0;

    init();

    function init(){

        //camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 1, 2000)
        //camera = new THREE.OrthographicCamera( window.innerWidth / 2, window.innerHeight / 2, 70, 1, 1000, - 1000, 1000 );
        camera = new THREE.OrthographicCamera( -aspectRatio * viewSize / 2, aspectRatio * viewSize / 2, viewSize / 2, -viewSize / 2, -2000, 2000 );

        camera.position.set(0, 200, 250);
        //camera.rotation.x = Math.PI / 2;
        camera.lookAt(new THREE.Vector3(0, 50, 0));

        renderer.setClearColor( 0x000000, 0 );
        renderer.setSize(window.innerWidth, window.innerHeight);

        document.body.appendChild(renderer.domElement);
        
        scene.add( ambient );
        
        directionalLight.position.set( 2, 0, 1 );
        scene.add( directionalLight );

        ground = new THREE.Mesh(new THREE.PlaneGeometry(canvasWidth, canvasHeight), new THREE.MeshNormalMaterial());
        ground.position.set(0, -50, 0);
        ground.rotation.x = Math.PI / 2;
        
        ground.overdraw = true;
        scene.add(ground);

      
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
        scene.add( line );

        
    }

    loadModels();

    function loadModels(){
        var manager = new THREE.LoadingManager();
        manager.onProgress = function ( item, loaded, total ) {
            console.log( item, loaded, total );
        };

        /*
        var texture = new THREE.Texture();

        var loader = new THREE.ImageLoader(manager);
        loader.load('models/UV_Grid_Sm.jpg', function(image){

            texture.image = image;
            texture.needsUpdate = true;

        }); 
        
        */

        var handGeometry = new THREE.CylinderGeometry( 12, 12, 600, 32 );
        var handMaterial = new THREE.MeshBasicMaterial( {color: 0xff0f00} );
        var hands = new THREE.Mesh( handGeometry, handMaterial );

        hands.position.set(0, 0, 0);

        var headGeometry = new THREE.SphereGeometry( 14, 32, 32 );
        var headMaterial = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
        var head = new THREE.Mesh( headGeometry, headMaterial );

        head.position.set(0, 0, 10);

        var torsoGeometry = new THREE.CubeGeometry( 10, 20, 50 );
        var torsoMaterial = new THREE.MeshBasicMaterial( {color: 0x0000ff} );
        var torso = new THREE.Mesh( torsoGeometry, torsoMaterial );

        torso.position.set(0, 0, -20);

        leftStick = new THREE.Object3D();
        leftStick.add(hands);
        leftStick.add(head);
        leftStick.add(torso);

        leftStick.position.set(-800, 0, 0);

        scene.add(leftStick);

        //collidableMeshList.push(leftStick);

        rightStick = new THREE.Object3D();
        rightStick.add(hands.clone());
        rightStick.add(head.clone());
        rightStick.add(torso.clone());

        rightStick.position.set(800, 0, 0);

        scene.add(rightStick);

        football = new THREE.Mesh(new THREE.SphereGeometry(30, 100, 100), new THREE.MeshNormalMaterial());
        football.overdraw = true;

        football.position.set(0, 0, 0);

        scene.add(football);

        goal1 =new THREE.Mesh(new THREE.CubeGeometry(30, 10, 600), new THREE.MeshNormalMaterial());
        goal1.overdraw = true;

        goal1.position.set(-900, 0, 0);

        
        scene.add(goal1);
        collidableMeshList.push(goal1);


        goal2 = new THREE.Mesh(new THREE.CubeGeometry(30, 10,600), new THREE.MeshNormalMaterial());
        goal2.overdraw = true;

        goal2.position.set(900, 0, 0);

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

        if(keyboard.pressed("left")){
            leftStick.rotation.y += 0.3;
            //leftStick.rotateOnAxis(leftStickAxis, 0);
        }
        if(keyboard.pressed("right")){
            leftStick.rotation.y -= 0.3;
        }

        /*

        var originPoint = football.position.clone();

        
        for (var vertexIndex = 0; vertexIndex < football.geometry.vertices.length; vertexIndex++){       
            var localVertex = football.geometry.vertices[vertexIndex].clone();
            var globalVertex = localVertex.applyMatrix4( football.matrix );
            var directionVector = globalVertex.sub( football.position );

            var ray = new THREE.Raycaster( originPoint, directionVector.clone().normalize() );
            var collisionResults = ray.intersectObjects( collidableMeshList );

            if (collisionResults.length > 0 && collisionResults[0].distance < directionVector.length()){

               
            }
                
        }
        */
    }

    function ballPhysics(){
    if (football.position.x <= -900){   
        if (football.position.y <=150 && football.position.y >= -150){
     
        opponentScore++;
        console.log("I loose");
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
        console.log("I win");
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



    function animate() {
   
        renderer.render(scene, camera);
        requestAnimationFrame( animate );
        ballPhysics();        
        update();

    }


    animate();
})();


/*

$.ajax({
    type : 'get',
    url : 'http://www.telize.com/geoip?callback=getgeoip',
    success : function(data){
        getPlayerDetails(data.country);
    }
});

function getPlayerDetails(country){
    $.ajax({
        type : 'post',
        url : 'php/index.php',
        data : { 'country_name' : country },
        success : function(data){
            console.log(data);
        }
    });
}
*/