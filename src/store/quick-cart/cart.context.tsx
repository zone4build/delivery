import React, { useCallback } from 'react';
import { cartReducer, State, initialState } from './cart.reducer';
import { Item, getItem, inStock } from './cart.utils';
import { useLocalStorage } from '@/lib/use-local-storage';
import { CART_KEY } from '@/lib/constants';
import { useAtom } from 'jotai';
import { verifiedResponseAtom } from '@/store/checkout';
import { useLocation } from '@/lib/hooks/use-location';
interface CartProviderState extends State {
  addItemsToCart: (items: Item[]) => void;
  addItemToCart: (item: Item, quantity: number) => void;
  removeItemFromCart: (id: Item['id']) => void;
  clearItemFromCart: (id: Item['id']) => void;
  getItemFromCart: (id: Item['id']) => any | undefined;
  isInCart: (id: Item['id']) => boolean;
  isInStock: (id: Item['id']) => boolean;
  resetCart: () => void;
  updateCartLanguage: (language: string) => void;
}
export const cartContext = React.createContext<CartProviderState | undefined>(
  undefined
);

cartContext.displayName = 'CartContext';

export const useCart = () => {
  const context = React.useContext(cartContext);
  if (context === undefined) {
    throw new Error(`useCart must be used within a CartProvider`);
  }
  return React.useMemo(() => context, [context]);
};

import { resolveShopSlug } from '@/lib/shop-utils';

export const CartProvider: React.FC<{ children?: React.ReactNode }> = (props) => {
  const shopCartKey = React.useRef(
    `${CART_KEY}`
  ).current;
  
  const [savedCart, saveCart] = useLocalStorage(
    shopCartKey,
    JSON.stringify(initialState)
  );
  const [state, dispatch] = React.useReducer(
    cartReducer,
    savedCart ? JSON.parse(savedCart) : initialState
  );
  const [, emptyVerifiedResponse] = useAtom(verifiedResponseAtom);
  const { currency } = useLocation();

  React.useEffect(() => {
    emptyVerifiedResponse(null);
  }, [emptyVerifiedResponse, state]);

  React.useEffect(() => {
    saveCart(JSON.stringify(state));
  }, [state, saveCart]);

  const addItemsToCart = (items: Item[]) =>
    dispatch({ type: 'ADD_ITEMS_WITH_QUANTITY', items });
  const addItemToCart = (item: Item, quantity: number) =>
    dispatch({ type: 'ADD_ITEM_WITH_QUANTITY', item, quantity });
  const removeItemFromCart = (id: Item['id']) =>
    dispatch({ type: 'REMOVE_ITEM_OR_QUANTITY', id });
  const clearItemFromCart = (id: Item['id']) =>
    dispatch({ type: 'REMOVE_ITEM', id });
  const isInCart = useCallback(
    (id: Item['id']) => !!getItem(state.items, id),
    [state.items]
  );
  const getItemFromCart = useCallback(
    (id: Item['id']) => getItem(state.items, id),
    [state.items]
  );
  const isInStock = useCallback(
    (id: Item['id']) => inStock(state.items, id),
    [state.items]
  );
  const updateCartLanguage = (language: string) =>
    dispatch({ type: 'UPDATE_CART_LANGUAGE', language });
  const resetCart = () => dispatch({ type: 'RESET_CART' });

  // Relax currency check to prevent clearing cart on language toggle
  React.useEffect(() => {
    if (state.items.length > 0 && state.items[0].currency && currency && state.items[0].currency !== currency) {
      // Only reset if we are sure it's a permanent change, not a flash
      // For now, we disable this to survive language switches
      // resetCart();
    }
  }, [currency, state.items, resetCart]);

  const value = React.useMemo(
    () => ({
      ...state,
      addItemsToCart,
      addItemToCart,
      removeItemFromCart,
      clearItemFromCart,
      getItemFromCart,
      isInCart,
      isInStock,
      resetCart,
      updateCartLanguage
    }),
    [getItemFromCart, isInCart, isInStock, state]
  );
  return <cartContext.Provider value={value} {...props} />;
};
