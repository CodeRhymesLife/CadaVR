Pin = function () {
    THREE.Group.call(this)
    
    var sphereGeometry = new THREE.SphereGeometry(0.5);
    var sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFF00 });
    this.sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    
    var cylingerLength = 2;
    var cylinderGeometry = new THREE.CylinderGeometry(0.1, 0.1, cylingerLength);
    var cylinderMaterial = new THREE.MeshBasicMaterial({ color: 0x808080 });
    this.cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
    this.cylinder.position.set(0, -cylingerLength/2, 0);
    
    this.add(this.sphere);
    this.add(this.cylinder);
    
    this.scale.multiplyScalar(0.05);
}

Pin.prototype = Object.create(THREE.Group.prototype);