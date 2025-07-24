"use client"
import React, { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import SpecialOfferCard from "@/components/atom/SpecialOfferCard";
import { toast } from "sonner";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation"
import { api, ENDPOINT } from "@/lib/api";
import { updateUserPremium } from "@/redux/userSlice";
import { useRazorpay } from "react-razorpay";
import { LucideLoader2 } from "lucide-react";

const offers = [
    {
        title: "Premium Monthly",
        features: [
            "Ad-Free (except sports & live)",
            "Includes all Premium content",
            "Any 1 device at a time (up to Asli 4K quality)",
            "Download and watch anytime"
        ],
        price: "29",
        originalPrice: "59",
        discountLabel: "51% OFF",
        duration: "1 Month"
    },
    {
        title: "Family",
        features: ["Enjoy all Premium plan benefits on up to 4 devices"],
        price: "89",
        originalPrice: "149",
        discountLabel: "40% OFF",
        duration: "1 Month"
    }
]

function Subscription() {
    const [activePrice, setActivePrice] = useState("");
    const userData = useSelector(state => state.user);
    const dispatch = useDispatch();
    const router = useRouter();
    const { Razorpay } = useRazorpay();
    const [loading, setLoading] = useState(false);

    const handlePaymentClick = async () => {
        if (activePrice === "") {
            toast("Select a card to join premium")
            return
        }
        if (!userData.isLoggedIn) {
            router.push("/login");
            return;
        }
        try {
            setLoading(true);
            const res = await api.post(`${ENDPOINT.payment}`, {
                email: userData.user?.email,
                amount: activePrice
            })
            const options = {
                key: process.env.NEXT_PUBLIC_KEY_ID ?? "rzp_test_cvU2jLcjggJY51",
                amount: res.data.amount,
                currency: "INR",
                name: "FilVuetv Corp",
                    description: `${
          activePrice === "29" ? "Premium Monthly" : "Family"
        } Plan Subscription`,
                order_id: res.data.orderId,
                handler: async function (response) {
                    toast(`Payment Successfull ${response.razorpay_order_id}`)
                    try {
                        const updatePremium = await api.patch(ENDPOINT.updatePremium, {
                            email: userData.user?.email
                        })
                        if (updatePremium.status === 200) {
                            dispatch(updateUserPremium(true))
                            toast("Premium access updated successfully")
                        }
                           router.push("/");
                    } catch (err) {
                        console.error(err)
                    }
                }
            }
            const rzp1 = new Razorpay(options);
            rzp1.on("payment.failed", function (response) {
                toast("reason " + response.error.reason)
            })
            rzp1.open();
            dispatch(updateUserPremium(true))
            toast("Premium access updated successfully");
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    }
    return (
        <div className="min-h-screen mt-[74px] w-full relative">
            <Image
                src="/motu-patlu.png"
                alt="Background Image"
                fill={true}
                quality={100}
                className="-z-50 hidden md:block object-cover"
            />

            <div className="mx-auto p-2 md:p-4 md:pt-8 pt-4">
                <div className="flex items-center justify-between md:mb-8 mb-4">
                    <Link
                        href="/"
                        className="hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg"
                    >
                        ←
                    </Link>
                </div>

                <Image
                    src="/motu-patlu.png"
                    alt="Background Image"
                    className="w-full md:hidden rounded-lg mb-4 h-[180px] object-cover"
                    width={354}
                    height={60}
                />

                <div className="md:mx-16">
                    <h1 className="md:text-4xl text-2xl leading-none font-black mb-4 text-nowrap">
                        FilVuetv Premium
                    </h1>
                    <p className="text-base md:text-lg mb-6 md:mb-8 w-full md:w-[70%] text-wrap hidden md:block">
                        Entertainment Redefined - The best of Hollywood, Before TV
                        premieres, Blockbuster movies, Exclusive series, India{`'`}s biggest
                        Kids & Family hub + 365 days of reality!
                    </p>
                    <div className="flex flex-col md:flex-row w-full md:gap-8 gap-2">
                        {offers.map((offer, index) => (
                            <SpecialOfferCard
                                key={index}
                                title={offer.title}
                                features={offer.features}
                                price={offer.price}
                                originalPrice={offer.originalPrice}
                                discountLabel={offer.discountLabel}
                                duration={offer.duration}
                                isActive={activePrice === offer.price}
                                onClick={() => setActivePrice(offer.price)}
                            />
                        ))}
                    </div>
                    <button
                        className="bg-pink-600 p-3 md:mt-10 mt-6 flex font-medium rounded-lg ml-2"
                        onClick={handlePaymentClick}
                    >
                        Continue & Pay
                        {loading && <LucideLoader2 className="animate-spin ml-2 w-4 h-4" />}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Subscription;