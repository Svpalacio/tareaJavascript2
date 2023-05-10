class Producto {
    sku;            // Identificador único del producto
    nombre;         // Su nombre
    categoria;      // Categoría a la que pertenece este producto
    precio;         // Su precio
    stock;          // Cantidad disponible en stock

    constructor(sku, nombre, precio, categoria, stock) {
        this.sku = sku;
        this.nombre = nombre;
        this.categoria = categoria;
        this.precio = precio;

        // Si no me definen stock, pongo 10 por default
        if (stock) {
            this.stock = stock;
        } else {
            this.stock = 10;
        }
        
    }
}
const queso = new Producto('KS944RUR', 'Queso', 10, 'lacteos', 4);
const gaseosa = new Producto('FN312PPE', 'Gaseosa', 5, 'bebidas');
const cerveza = new Producto('PV332MJ', 'Cerveza', 20, 'bebidas');
const arroz = new Producto('XX92LKI', 'Arroz', 7, 'alimentos', 20);
const fideos = new Producto('UI999TY', 'Fideos', 5, 'alimentos');
const lavandina = new Producto('RT324GD', 'Lavandina', 9, 'limpieza');
const shampoo = new Producto('OL883YE', 'Shampoo', 3, 'higiene', 50);
const jabon = new Producto('WE328NJ', 'Jabon', 4, 'higiene', 3);

// Genero un listado de productos. Simulando base de datos
const productosDelSuper = [queso, gaseosa, cerveza, arroz, fideos, lavandina, shampoo, jabon];

console.log("-> PRODUCTOS DEL SUPER:")
productosDelSuper.forEach((element,index) => {
    console.log(`Producto ${index+1}: ${element.sku} ${element.nombre}, precio: $${element.precio}, categ.:${element.categoria}, stock: ${element.stock}`);
});


// Cada cliente que venga a mi super va a crear un carrito
class Carrito {
    productos;      // Lista de productos agregados
    categorias;     // Lista de las diferentes categorías de los productos en el carrito
    precioTotal;    // Lo que voy a pagar al finalizar mi compra

    // Al crear un carrito, empieza vació
    constructor() {
        this.precioTotal = 0;
        this.productos = [];
        this.categorias = [];
    }

    // función que agrega @{cantidad} de productos con @{sku} al carrito
     
    async agregarProducto(sku, cantidad) {
        console.log(`Agregando: ${cantidad} unidades de ${sku}`);

        try{
           // Busco el producto en la "base de datos"
           const producto = await findProductBySku(sku);
                          
          // Creo un producto nuevo    
            if (cantidad<= producto.stock){
                //console.log(`* Producto agregado: ${sku} ${producto.nombre}, cantidad:${cantidad}, $${producto.precio} c/u`);
                
                const nuevoProducto = new ProductoEnCarrito(sku, producto.nombre, cantidad);
                
                const buscarSku = this.productos.find(element=>element.sku === sku) //busca en carrito

                if (buscarSku === undefined){
                       console.log(`* Producto agregado: ${sku} ${producto.nombre}, cantidad:${cantidad}, $${producto.precio} c/u`);
                       this.productos.push(nuevoProducto);
                       this.precioTotal = this.precioTotal + (producto.precio * cantidad);
                       if (!this.categorias.includes(producto.categoria)) {
                          this.categorias.push(producto.categoria); //Se actualiza la lista categorías solamente si no existe
                       }
                }else{       
                        console.log(`* Producto agregado: ${sku} ${producto.nombre}, cantidad:${cantidad}, $${producto.precio} c/u. YA AGREGADO, se sumará a lo cargado con anterioridad.`);
                        this.precioTotal = this.precioTotal + (producto.precio * cantidad);
                        buscarSku.cantidad += cantidad                        
                } 

                let indice = productosDelSuper.indexOf(producto); //se disminuye el stock
                productosDelSuper[indice].stock -= cantidad;  
                                                     
            }else{  //cantidad supera el stock
                console.log(`   ¡Atención: producto: ${sku} ${producto.nombre}, cantidad:${cantidad}, supera el stock disponible (${producto.stock}). NO SE AGREGA.`);
            }
        } catch (error) {
             console.log(error);
        }        
    }

    // función que elimina @{cantidad} de productos con @{sku} al carrito

    async eliminarProducto(sku,cantidad) {
        console.log(`Eliminando: ${cantidad} unidades de ${sku}`);
        const productoEliminado = await findProductCarrito(sku);
        
        try{
            let idx = this.productos.findIndex(producto => producto.sku == sku)
            if (idx >=0 ){
                if (this.productos[idx].cantidad <= cantidad) {
                    this.productos.splice(idx,1);
                } else {
                    this.productos[idx].cantidad -= cantidad;
                }
                const objetoEncontrado = productosDelSuper.find(product=>product.sku===sku); //busco precio en productosDelSuper
                const precioEncontrado= objetoEncontrado.precio;
                this.precioTotal = this.precioTotal - (precioEncontrado*cantidad); //resto del PrecioTotal del carrito
                const indexEncontrado = productosDelSuper.findIndex(product => product.sku === sku);
                productosDelSuper[indexEncontrado].stock += cantidad //aumenta el stock
                
                console.log(`* Producto ELIMINADO: ${sku} ${productoEliminado.nombre}, cantidad:${cantidad}, $${precioEncontrado} c/u`);
            } else {
                console.log(`* Producto No encontrado: ${sku}`); 
            }
            
        } catch (error) {
            console.log(error);
        } 
    }
}



// Cada producto que se agrega al carrito es creado con esta clase
class ProductoEnCarrito{
    sku;       // Identificador único del producto
    nombre;    // Su nombre
    cantidad;  // Cantidad de este producto en el carrito

    constructor(sku, nombre, cantidad) {
        this.sku = sku;
        this.nombre = nombre;
        this.cantidad = cantidad;
    }
}

// Función que busca un producto por su sku en "la base de datos"
function findProductBySku(sku) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const foundProduct = productosDelSuper.find(product => product.sku === sku);
            if (foundProduct) {
                resolve(foundProduct);
            } else {
                reject(`* Producto: ${sku} no existe en el Super`);
            }
        }, 1500);
    });
}

// Función que busca un producto por su sku en "el carrito"
function findProductCarrito(sku) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const buscarSku = carrito.productos.find(element=>element.sku === sku) //busca en carrito
                if (buscarSku != undefined){
                    resolve(buscarSku)
                } else {
                    reject(`* Producto: ${sku} no existe en el Carrito`);
            }
        }, 1500);
    });
}

const carrito = new Carrito();
console.log("-> LISTA DE COMPRAS:")
carrito.agregarProducto('WE328NJ', 1); 
carrito.agregarProducto('sole', 5); //no existe en el super
carrito.agregarProducto('WE328NJ', 1);
carrito.agregarProducto('UI999TY',1); 
carrito.agregarProducto('OL883YE', 55); 
carrito.agregarProducto('UI999TY',4); 
carrito.agregarProducto('KS944RUR', 3);
carrito.agregarProducto('PV332MJ', 9); 
carrito.agregarProducto('FN312PPE', 2);
//carrito.agregarProducto('WE328NJ', 1); 
//carrito.eliminarProducto('UI999TY',3);
//carrito.eliminarProducto('SOLE', 1)
carrito.eliminarProducto('WE328NJ', 1)
//console.log("El carrito contiene al final "+carrito.productos) 
            
