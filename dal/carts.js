const { CartItem } = require('../models');

const getCart = async (customerId) => {
    return await CartItem.collection()
        .where({
            'customer_id': customerId
        }).fetch({
            require: false,
            withRelated: ['variant', 'customer','variant.product', 'variant.size','variant.spiciness']
        });
}

const getCartByCustomerVariant = async (customerId, variantId) => {
    return await CartItem.where({
        'customer_id': customerId,
        'variant_id': variantId
    }).fetch({
        require:false
    })
}

const createCartItem = async (customerId, variantId, quantity) => {
    let cartItem = new CartItem({
        'customer_id': customerId,
        'variant_id': variantId,
        'quantity': quantity
    })
    await cartItem.save();
    return cartItem;
}

const removeCartItem = async (customerId, variantId) => {
    let cartItem = await getCartByCustomerVariant(customerId, variantId);
    // await cartItem.destroy()
    if (cartItem) {
        await cartItem.destroy();
        return true;
    } else {
        return false
    }
}

async function updateQuantity(customerId, variantId, newQuantity) {
    const cartItem = await getCartByCustomerVariant(customerId, variantId);
    if (cartItem) {
        cartItem.set('quantity', newQuantity);
        cartItem.save();
        return true;
    } else {
        return false;
    }

}

module.exports = { getCart, getCartByCustomerVariant, createCartItem, removeCartItem, updateQuantity }



