(function(){

    var leftStick
    , rightStick
    , football
    , scene = new THREE.Scene()
    , camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 1, 2000)
    , renderer = new THREE.WebGLRenderer({ alpha: true })
    , clock = new THREE.Clock()
    , keyboard = new KeyboardState()
    , ambient = new THREE.AmbientLight( 0x101030 )
    , directionalLight = new THREE.DirectionalLight( 0xffeedd );

    init();

    function init(){

        renderer.setClearColor( 0x000000, 0 );
        renderer.setSize(window.innerWidth, window.innerHeight);

        document.body.appendChild(renderer.domElement);

        camera.position.x = 2;
        camera.position.y = 1;
        camera.position.z = 6;

        
        scene.add( ambient );

        
        directionalLight.position.set( 2, 0, 1 );
        scene.add( directionalLight );

    }

    loadModels();

    function loadModels(){
        var manager = new THREE.LoadingManager();
        manager.onProgress = function ( item, loaded, total ) {
            console.log( item, loaded, total );
        };

        var texture = new THREE.Texture();

        var loader = new THREE.ImageLoader(manager);
        loader.load('models/UV_Grid_Sm.jpg', function(image){

            texture.image = image;
            texture.needsUpdate = true;

        });

        var loader = new THREE.OBJLoader(manager);
        loader.load( 'models/FoosballPlayer_new.obj', function(model){
            model.traverse( function ( child ) {
                if (child instanceof THREE.Mesh ) {
                    child.material.map = texture;
                }
            });

            model.position.x = 0;
            model.position.y = 0;
            model.position.z = 0;

            leftStick = model;

            scene.add(model);

        });

        var loader = new THREE.OBJLoader(manager);
        loader.load( 'models/FoosballPlayer_new.obj', function(model){
            model.traverse( function ( child ) {
                if (child instanceof THREE.Mesh ) {
                    child.material.map = texture;
                }
            });

            model.position.x = 4;
            model.position.y = 0;
            model.position.z = 0;

            rightStick = model;

            scene.add( model );

        });

        football = new THREE.Mesh(new THREE.SphereGeometry(0.2, 100, 100), new THREE.MeshNormalMaterial());
        football.overdraw = true;
        scene.add(football);
    }
    

    function render() {
        var timer = Date.now() * 0.005;

        football.position.x = 1 * Math.cos(timer);
        football.position.y = 1 * Math.sin(timer);

        

        renderer.render(scene, camera);
    };

    function update() {
        keyboard.update();

        var moveDistance = 5 * clock.getDelta(); 

        if(keyboard.pressed("up")) 
            leftStick.translateZ( -0.1 );

        if(keyboard.pressed("down")) 
            leftStick.translateZ(  0.1 );

    }

    function animate() {
    
        requestAnimationFrame( animate );
        render();       
        update();

    }


    animate();
})();