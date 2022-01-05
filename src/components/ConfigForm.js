const ConfigForm = () => {
  return (
    <section class="text-gray-700 ">
      <div class="container px-8 pt-48 pb-24 mx-auto lg:px-4">
        <div class="flex flex-col w-full p-8 mx-auto mt-10 border rounded-lg lg:w-2/6 md:w-1/2 md:ml-auto md:mt-0">
          <div class="relative ">
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Password"
              class="w-full px-4 py-2 mb-4 mr-4 text-base text-black transition duration-500 ease-in-out transform border-transparent rounded-lg bg-blueGray-100 focus:border-gray-500 focus:bg-white focus:outline-none focus:shadow-outline focus:ring-2 ring-offset-current ring-offset-2"
            />
          </div>
          <div class="relative ">
            <input
              type="email"
              id="email"
              name="email"
              placeholder="email"
              class="w-full px-4 py-2 mb-4 mr-4 text-base text-black transition duration-500 ease-in-out transform border-transparent rounded-lg bg-blueGray-100 focus:border-gray-500 focus:bg-white focus:outline-none focus:shadow-outline focus:ring-2 ring-offset-current ring-offset-2"
            />
          </div>
          <div class="flex my-4">
            <label class="flex items-center">
              <input type="checkbox" class="form-checkbox" />
              <span class="ml-2">Subscribe me </span>
            </label>
          </div>
          <button class="px-8 py-2 font-semibold text-white transition duration-500 ease-in-out transform bg-black rounded-lg hover:bg-gray-800 hover:to-black focus:shadow-outline focus:outline-none focus:ring-2 ring-offset-current ring-offset-2">
            Button
          </button>
          <p class="mx-auto mt-3 text-xs text-gray-500">
            Literally you probably haven't heard of them jean shorts.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ConfigForm;
