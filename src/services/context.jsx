import React, { Component, createContext } from "react";
import { store, detailProduct } from "./fakeServices";
const ProductContext = createContext();

class ProductProvider extends Component {
  state = {
    products: [],
    detailProduct,
    cart: [],
    subTotal: 0,
    tax: 0,
    total: 0,
    isModalOpen: false,
    modalProduct: detailProduct,
  };

  componentDidMount() {
    let products = [];
    store.forEach((item) => {
      products = [...products, { ...item }];
    });
    this.setState({ products });
  }

  getItem = (id) => {
    const { products } = this.state;
    return products.find((product) => product.id === id);
  };

  handleProductDetail = (id) => {
    const detailProduct = this.getItem(id);
    this.setState({ detailProduct });
  };

  addToCart = (id) => {
    const products = [...this.state.products];
    const index = products.findIndex((product) => product.id === id);
    const product = products[index];
    product.inCart = !product.inCart;
    product.count = product.count + 1;
    product.total = product.total + product.price;
    this.setState(
      {
        products,
        cart: [...this.state.cart, product],
      },
      () => this.computeTotal()
    );
  };

  openModal = (id) => {
    const { isModalOpen } = this.state;
    const product = this.getItem(id);
    this.setState({
      modalProduct: product,
      isModalOpen: !isModalOpen,
    });
  };

  closeModal = () => {
    const { isModalOpen } = this.state;
    this.setState({ isModalOpen: !isModalOpen });
  };

  increment = (id) => {
    const cart = [...this.state.cart];
    const index = cart.findIndex((el) => el.id === id);
    const cartItem = cart[index];
    cartItem.count++;
    cartItem.total = cartItem.count * cartItem.price;
    this.setState({ cart }, () => this.computeTotal());
  };

  decrement = (id) => {
    const cart = [...this.state.cart];
    const index = cart.findIndex((el) => el.id === id);
    const cartItem = cart[index];
    const { count } = cartItem;
    switch (count) {
      case 0:
        this.removeItem(id);
        break;
      default:
        cartItem.count--;
        cartItem.total = cartItem.count * cartItem.price;
        this.setState({ cart }, () => this.computeTotal());
    }
  };

  removeItem = (id) => {
    const products = [...this.state.products];
    const cart = [...this.state.cart];
    const newCart = cart.filter((item) => item.id !== id);
    const product = this.getItem(id);
    const index = products.indexOf(product);
    products[index].inCart = false;
    products[index].count = 0;
    products[index].total = 0;
    this.setState({ cart: newCart, products }, () => this.computeTotal());
  };

  // clears the cart
  // loads a fresh copy of the store
  // sets the subtotal, tax and total to zero
  clearCart = () => {
    this.setState(
      {
        cart: [],
      },
      () => {
        this.componentDidMount();
        this.computeTotal();
      }
    );
  };

  computeTotal = () => {
    let subTotal = 0;
    this.state.cart.forEach((item) => {
      subTotal += item.total;
    });
    const tax = Math.round(parseFloat((subTotal * 0.05).toFixed(2)));
    const total = subTotal + tax;
    this.setState({
      subTotal,
      tax,
      total,
    });
  };

  render() {
    const {
      cart,
      subTotal,
      tax,
      total,
      products,
      detailProduct,
      isModalOpen,
      modalProduct,
    } = this.state;
    return (
      <ProductContext.Provider
        value={{
          products,
          detailProduct,
          handleProductDetail: this.handleProductDetail,
          addToCart: this.addToCart,
          isModalOpen,
          modalProduct,
          openModal: this.openModal,
          closeModal: this.closeModal,
          cart,
          subTotal,
          tax,
          total,
          increment: this.increment,
          decrement: this.decrement,
          removeItem: this.removeItem,
          clearCart: this.clearCart,
        }}
      >
        {this.props.children}
      </ProductContext.Provider>
    );
  }
}

const ProductConsumer = ProductContext.Consumer;

export { ProductProvider, ProductConsumer };
