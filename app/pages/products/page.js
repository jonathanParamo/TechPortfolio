'use client'

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '@/app/features/products/productsProviders';
import { addToCart } from '@/app/features/cart/cartProvider';
import Image from 'next/image';

const ProductsPage = () => {
  const dispatch = useDispatch();
  const products = useSelector((state) => state.products.items);
  const status = useSelector((state) => state.products.status);
  const error = useSelector((state) => state.products.error);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchProducts());
    }
  }, [dispatch, status]);

  const handleAddToCart = (product) => {
    dispatch(addToCart(product));
  };

  return (
    <div>
      <main className="bg-[#000000] w-full pb-3  px-5 ">
        {status === 'loading' && <p>Loading...</p>}
        {status === 'failed' && <p>Error: {error}</p>}
        {status === 'succeeded' && (
          <div className="w-full items-start flex ">
            <ul className="grid grid-cols-1 mt-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <li
                  key={product.id}
                  className="w-full h-72 md:h-80 flex flex-col items-center border border-cyan-700
                  border-2 py-3 px-2 rounded bg-[#f5f5f510]"
                >
                  <Image
                    src={product.image}
                    alt={product.title}
                    width={100}
                    className='w-40 h-32 mt-3 rounded'
                  />
                  <h2 className='w-full text-center my-3 overflow-y-hidden h-6'>{product.title}</h2>
                  <p className='hidden text-center text-sm md:block mb-3 h-10 overflow-y-hidden px-2'>
                    {product.description}
                  </p>
                  <div className='w-full flex justify-around items-center'>
                    <p className='mt-1 text-white px-2 py-1 rounded'>
                      Price: ${product.price}
                    </p>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="mt-1 bg-blue-500 text-white px-2 py-1 rounded"
                    >
                      Add to Cart
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProductsPage;
