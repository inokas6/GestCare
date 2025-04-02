import React from 'react';

const not = () => {
    return (
        <div className="w-[calc(100%-60px)] ">
            <div className="my-5 mx-8 flex flex-col md:flex-row w-[calc(100%-60px)] overflow-hidden rounded-lg shadow-md">
                {/* Left section with pink background and text */}
                <div className="bg-pink-200 p-6 md:w-1/3 flex flex-col justify-center items-center text-center">
                    <p className="text-gray-800 mb-6">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam eu magna finibus, consectetur neque in, mollis odio. Aliquam sapien mauris, vulputate ac ultrices sit amet, tempus vel nibh.
                    </p>
                    <button className="btn btn-warning btn-sm bg-yellow-100 hover:bg-yellow-200 text-gray-800 font-semibold normal-case">
                        Increve-te Gratuitamente
                    </button>
                </div>

                {/* Right section with the pregnancy image */}
                <div className="bg-amber-50 md:w-2/3">
                    <div className="h-full w-full flex items-center justify-center overflow-hidden">
                        <img
                            src="/api/placeholder/800/500"
                            alt=""
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>
            </div>
        </div>);
};

export default not;