function getCart(){try{return JSON.parse(localStorage.getItem('letsoCart'))||[]}catch{return[]}}
function saveCart(c){localStorage.setItem('letsoCart',JSON.stringify(c))}
function addToCart(id,name,price,image){
 let cart=getCart();
 let f=cart.find(i=>i.id===id);
 if(f) f.qty++; else cart.push({id,name,price,image,qty:1});
 saveCart(cart);
 updateCartBadge();
 alert(name+' added to cart.');
}
function updateCartBadge(){
 let cart=getCart();
 let count=cart.reduce((s,i)=>s+i.qty,0);
 let b=document.getElementById('cart-count');
 if(b) b.textContent=count;
}
document.addEventListener('DOMContentLoaded',updateCartBadge);
function removeFromCart(id){
 let cart=getCart().filter(i=>i.id!==id);
 saveCart(cart);
 location.reload();
}
