// donation page code
"use client";
import { v4 as uuidv4 } from "uuid";
import AppShell from "@/components/layout/AppShell";
import { useState, useRef, Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Lock } from "lucide-react";
import DatePicker from "@/components/common/DatePicker";
import {
  MOCK_TEMPLE,
  MOCK_SEVA,
  PRESET_AMOUNTS,
  DEFAULT_SELECTED_AMOUNT,
} from "@/constants/mock.data";
import {
  useCreateOrderMutation,
  useVerifyPaymentMutation,
  useMarkPaymentFailedMutation,
} from "@/store/api/paymentApi";
import { useLanguage } from "@/context/LanguageContext";
import { downloadReceipt } from "@/lib/generateReceipt";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const DEFAULT_GRADIENT = "linear-gradient(160deg, #6B2D0E 0%, #3B1208 100%)";
const TEMPLE_API_URL =
  process.env.NEXT_PUBLIC_TEMPLE_API_URL ?? "http://127.0.0.1:3001";

const TEMPLE_SERVICE_URL =
  process.env.NEXT_PUBLIC_TEMPLE_SERVICE_URL ?? "http://127.0.0.1:3001";

type RazorpayResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayInstance = {
  open: () => void;
  on: (event: string, handler: (response: RazorpayFailureResponse) => void) => void;
};

type RazorpayFailureResponse = {
  error: {
    code: string;
    description: string;
    reason?: string;
  };
};

type RazorpayConstructor = new (options: object) => RazorpayInstance;

declare global {
  interface Window {
    Razorpay: RazorpayConstructor;
  }
}

type FestivalSeva = {
  id: string;
  festivalId: string;
  templeId: string;
  name: string;
  isSelected?: boolean;
  isActive?: boolean;
};

function DonationPageInner() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [createOrder] = useCreateOrderMutation();
  const [verifyPayment] = useVerifyPaymentMutation();
  const [markPaymentFailed] = useMarkPaymentFailedMutation();

  // Temple + offering info from URL params (fall back to mock data for direct nav)
  const templeId = searchParams.get("templeId") ?? MOCK_TEMPLE.id;
  const templeName = searchParams.get("templeName") ?? MOCK_TEMPLE.name;
  const templeLocation =
    searchParams.get("templeLocation") ?? MOCK_TEMPLE.location;
  const [templeImage, setTempleImage] = useState("");
  const rawOfferingId = searchParams.get("offeringId");
  const offeringId =
    rawOfferingId && UUID_REGEX.test(rawOfferingId) ? rawOfferingId : undefined;

  const fixedAmount = Number(searchParams.get("fixedAmount") ?? 0);
  const festivalId = searchParams.get("festivalId") ?? "";
  const festivalName = searchParams.get("festivalName") ?? "";
  const festivalImageUrl = searchParams.get("festivalImageUrl") ?? "";
  const festivalOfferingDate = searchParams.get("offeringDate") ?? "";

  const offeringType = searchParams.get("offeringType") ?? "donation";
  const isFestival = offeringType === "festival";

  const [festivalImagePreviewUrl, setFestivalImagePreviewUrl] = useState("");

  const [festivalSevaNames, setFestivalSevaNames] = useState<string[]>([]);

  const offeringName = isFestival
    ? festivalName || "Festival Offering"
    : (searchParams.get("offeringName") ?? MOCK_SEVA.name);

  const offeringDesc = isFestival
    ? festivalSevaNames.length > 0
      ? festivalSevaNames.join(", ")
      : "Festival Seva"
    : (searchParams.get("offeringDesc") ?? MOCK_SEVA.description);

  const fromTemple = !!searchParams.get("templeId");

  useEffect(() => {
    if (!templeId) return;

    async function fetchTemple() {
      try {
        const res = await fetch(`${TEMPLE_API_URL}/temples/${templeId}`);

        if (!res.ok) return;

        const temple = await res.json();

        setTempleImage(temple.imageUrl || temple.imageUrls?.[0] || "");
      } catch (err) {
        console.error("Failed to load temple:", err);
      }
    }

    fetchTemple();
  }, [templeId]);
  const isArchana = offeringType === "archana";

  const [selectedAmount, setSelectedAmount] = useState<number>(
    DEFAULT_SELECTED_AMOUNT,
  );
  const [customAmount, setCustomAmount] = useState<string>("");
  const [nakshatra, setNakshatra] = useState("");
  const [gotra, setGotra] = useState("");

  const loginUser =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("devoteUser") || "{}")
      : {};

  const userId =
    loginUser?.id ??
    loginUser?.userId ??
    loginUser?.uid ??
    loginUser?.sub ??
    "";
  const [devoteeName, setDevoteeName] = useState(() => {
    if (typeof window === "undefined") return "";
    try {
      const stored = localStorage.getItem("devoteUser");
      if (!stored) return "";
      const parsed = JSON.parse(stored);
      return (
        parsed.displayName ||
        [parsed.firstName, parsed.lastName].filter(Boolean).join(" ") ||
        ""
      );
    } catch {
      return "";
    }
  });
  const [offeringDate, setOfferingDate] = useState<string>(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [amountError, setAmountError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentFailed, setPaymentFailed] = useState(false);
  const [failureReason, setFailureReason] = useState("");
  const paymentOutcomeHandledRef = useRef(false);

  const [paymentData, setPaymentData] = useState<{
    transactionId: string;
    amount: number;
    paymentMethod: string;
    date: string;
    offeringDate: string;
  } | null>(null);

  const parsedCustom = Math.floor(Number(customAmount));
  const isValidCustom =
    customAmount !== "" &&
    !isNaN(parsedCustom) &&
    parsedCustom > 0 &&
    /^\d+$/.test(customAmount);

  const finalAmount = isArchana
    ? fixedAmount
    : isValidCustom
      ? parsedCustom
      : selectedAmount;
  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "") {
      setCustomAmount("");
      setAmountError("");
      setSelectedAmount(DEFAULT_SELECTED_AMOUNT);
      return;
    }
    if (!/^\d+$/.test(val)) {
      setAmountError(t.invalidAmountError);
      return;
    }
    const num = Number(val);
    if (num <= 0) {
      setAmountError(t.amountPositiveError);
      setCustomAmount(val);
      return;
    }
    setAmountError("");
    setCustomAmount(val);
    setSelectedAmount(0);
  };

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  useEffect(() => {
  if (!isFestival) {
    setFestivalSevaNames([]);
    return;
  }

  const sevaNames = searchParams.get("sevaNames");

  if (sevaNames) {
    setFestivalSevaNames(sevaNames.split(","));
  } else {
    setFestivalSevaNames([]);
  }
}, [isFestival, searchParams]); 

  useEffect(() => {
    if (!isFestival || !festivalImageUrl) {
      setFestivalImagePreviewUrl("");
      return;
    }

    let isActive = true;

    const loadFestivalImage = async () => {
      try {
        const apiGatewayUrl = process.env.NEXT_PUBLIC_API_GATEWAY_URL;

        if (!apiGatewayUrl) {
          throw new Error("NEXT_PUBLIC_API_GATEWAY_URL is missing");
        }

        const response = await fetch(
          `${apiGatewayUrl}/upload/presigned-url?key=${encodeURIComponent(
            festivalImageUrl,
          )}`,
        );

        if (!response.ok) {
          throw new Error(`Failed to load festival image: ${response.status}`);
        }

        const data = await response.json();

        if (isActive) {
          setFestivalImagePreviewUrl(data.url ?? "");
        }
      } catch (error) {
        console.error("FESTIVAL IMAGE LOAD ERROR:", error);

        if (isActive) {
          setFestivalImagePreviewUrl("");
        }
      }
    };

    loadFestivalImage();

    return () => {
      isActive = false;
    };
  }, [festivalImageUrl, isFestival]);

  const handlePayment = async () => {
    if (!!amountError || finalAmount < 100) return;
    const user = JSON.parse(localStorage.getItem("devoteUser") || "{}");
    setIsLoading(true);
    setPaymentFailed(false);
    setFailureReason("");
    paymentOutcomeHandledRef.current = false;
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        alert("Razorpay failed to load");
        setIsLoading(false);
        return;
      }
      console.log("Sending payment metadata:", {
        userId,
        templeId,
        devoteeName,
        nakshatra,
        gotra,
        offeringType: isFestival
          ? "festival"
          : isArchana
            ? "archana"
            : "donation",
        offeringDate,
      });
      let orderData;
      try {
        orderData = await createOrder({
          amount: finalAmount,
          currency: "INR",
          orderId: uuidv4(),
          templeId,
          userId,
          devoteeName:
            devoteeName.trim() || loginUser?.displayName || "Devotee",
          nakshatra,
          gotra,
          offeringType: isFestival
            ? "festival"
            : isArchana
              ? "archana"
              : "donation",
          ...(festivalId && { festivalId }),
          ...(offeringId && { offeringId }),
          remarks: offeringName,
          offeringDate,
          userId: user.id,
        }).unwrap();
      } catch {
        alert("Order creation failed");
        setIsLoading(false);
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Devotee",
        description: `${offeringName} - ${templeName}`,
        order_id: orderData.razorpayOrderId,
        prefill: {
          name: devoteeName,
          email: "",
          contact: "",
        },
        theme: { color: "#C8773A" },
        // Razorpay calls this handler only on successful payment. We still
        // verify the signature ourselves and flip the transaction status,
        // instead of relying solely on the webhook (which can't reach a
        // local/dev callback URL and would leave the transaction "Pending").
        handler: async (response: RazorpayResponse) => {
          paymentOutcomeHandledRef.current = true;
          setIsLoading(true);
          try {
            const result = await verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              orderId: orderData.orderId,
              amount: finalAmount,
              currency: orderData.currency,
              templeId,
            }).unwrap();

            if (!result.success) {
              setFailureReason(
                "We couldn't verify your payment. Please contact support if the amount was debited.",
              );
              setPaymentFailed(true);
              return;
            }

            const [y, m, d] = offeringDate.split("-").map(Number);
            const formatted = new Date(y, m - 1, d).toLocaleDateString(
              "en-IN",
              {
                year: "numeric",
                month: "long",
                day: "numeric",
              },
            );
            setPaymentData({
              transactionId: response.razorpay_payment_id,
              amount: finalAmount,
              paymentMethod: "UPI",
              date: new Date().toLocaleDateString("en-IN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              }),
              offeringDate: formatted,
            });
            setPaymentSuccess(true);
          } catch {
            setFailureReason(
              "We couldn't verify your payment. Please contact support if the amount was debited.",
            );
            setPaymentFailed(true);
          } finally {
            setIsLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsLoading(false);
            if (paymentOutcomeHandledRef.current) return;
            paymentOutcomeHandledRef.current = true;
            markPaymentFailed({
              razorpayOrderId: orderData.razorpayOrderId,
              reason: "Payment cancelled by user",
            });
            setFailureReason("Payment was cancelled.");
            setPaymentFailed(true);
          },
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", (response: RazorpayFailureResponse) => {
        paymentOutcomeHandledRef.current = true;
        markPaymentFailed({
          razorpayOrderId: orderData.razorpayOrderId,
          reason: response.error?.description,
        });
        setFailureReason(
          response.error?.description || "Payment failed. Please try again.",
        );
        setPaymentFailed(true);
        setIsLoading(false);
      });

      rzp.open();
      setIsLoading(false);
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  const handleBackToChooser = () => {
    if (isFestival) {
      router.push("/home");
      return;
    }

    if (fromTemple) {
      router.push(`/temples/${templeId}`);
      return;
    }

    router.push("/home");
  };

  if (paymentFailed) {
    return (
      <AppShell title="Donation Screen">
        <div
          className="min-h-screen bg-[#F5F0E8]"
          style={{ fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif" }}
        >
          <main className="flex justify-center px-8 py-6">
            <div className="w-full max-w-[560px]">
              <div className="h-[8px] bg-[#E53935] rounded-t-3xl" />

              <div className="bg-white rounded-b-3xl shadow-sm px-10 py-10 flex flex-col items-center">
                <div className="w-[72px] h-[72px] rounded-full bg-[#E53935] flex items-center justify-center mb-5">
                  <svg
                    width="36"
                    height="36"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </div>

                <h2 className="text-[22px] font-bold text-[#1A0F00] mb-2">
                  Transaction Failed
                </h2>

                <p className="text-[14px] text-[#7A6248] mb-8 text-center">
                  {failureReason || "Your payment could not be completed."}
                </p>

                <div className="flex gap-4 w-full">
                  <Button
                    variant="outline"
                    className="flex-1 h-[48px] rounded-xl border-[1.5px] border-[#C8773A] text-[#C8773A] text-[14px] font-semibold bg-white hover:bg-[#FFF5EE] transition-colors"
                    onClick={handleBackToChooser}
                  >
                    Back
                  </Button>
                  <Button
                    className="flex-1 h-[48px] rounded-xl text-[14px] font-bold text-white border-0 hover:opacity-90 transition-all"
                    style={{
                      background:
                        "linear-gradient(135deg, #D4820A 0%, #B86010 100%)",
                    }}
                    onClick={() => {
                      setPaymentFailed(false);
                      setFailureReason("");
                    }}
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </AppShell>
    );
  }

  if (paymentSuccess && paymentData) {
    return (
      <AppShell title="Donation Screen">
        <div
          className="min-h-screen bg-[#F5F0E8]"
          style={{ fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif" }}
        >
          <main className="flex justify-center px-8 py-6">
            <div className="w-full max-w-[560px]">
              <div className="h-[8px] bg-[#2E7D32] rounded-t-3xl" />

              <div className="bg-white rounded-b-3xl shadow-sm px-10 py-10 flex flex-col items-center">
                <div className="w-[72px] h-[72px] rounded-full bg-[#2E7D32] flex items-center justify-center mb-5">
                  <svg
                    width="36"
                    height="36"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>

                <h2 className="text-[22px] font-bold text-[#1A0F00] mb-2">
                  Transaction Successful
                </h2>

                <p className="text-[36px] font-bold text-[#1A0F00] mb-8 tracking-tight">
                  INR{" "}
                  {paymentData.amount.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>

                <div className="w-full bg-[#FAF7F2] rounded-2xl border border-[#EDE8DF] px-6 py-5 mb-6">
                  <div className="grid grid-cols-2 gap-4 mb-5">
                    <div>
                      <p className="text-[12px] text-[#9C7E5A] mb-1">
                        Sender Name
                      </p>
                      <p className="text-[14px] font-semibold text-[#1A0F00]">
                        {devoteeName}
                      </p>
                    </div>
                    <div>
                      <p className="text-[12px] text-[#9C7E5A] mb-1">
                        Payment Method
                      </p>
                      <p className="text-[14px] font-semibold text-[#1A0F00]">
                        {paymentData.paymentMethod}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-5">
                    <div>
                      <p className="text-[12px] text-[#9C7E5A] mb-1">
                        Transaction ID
                      </p>
                      <p className="text-[14px] font-semibold text-[#1A0F00] break-all">
                        {paymentData.transactionId}
                      </p>
                    </div>
                    <div>
                      <p className="text-[12px] text-[#9C7E5A] mb-1">Date</p>
                      <p className="text-[14px] font-semibold text-[#1A0F00]">
                        {paymentData.date}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-[#EDE8DF] mb-5" />

                  <div>
                    <p className="text-[12px] text-[#9C7E5A] mb-1">
                      Offered For
                    </p>
                    <p className="text-[14px] font-semibold text-[#1A0F00]">
                      {offeringName} at {templeName}
                    </p>
                  </div>

                  <div className="mt-4">
                    <p className="text-[12px] text-[#9C7E5A] mb-1">
                      Date of Offering
                    </p>
                    <p className="text-[14px] font-semibold text-[#1A0F00]">
                      {paymentData.offeringDate}
                    </p>
                  </div>
                </div>

                <p className="text-[13px] text-[#9C7E5A] italic mb-8 text-center">
                  &ldquo;May your devotion bring blessings to you and your
                  family 🙏&rdquo;
                </p>

                <div className="flex gap-4 w-full">
                  <Button
                    variant="outline"
                    className="flex-1 h-[48px] rounded-xl border-[1.5px] border-[#C8773A] text-[#C8773A] text-[14px] font-semibold bg-white hover:bg-[#FFF5EE] transition-colors"
                    onClick={() => window.print()}
                  >
                    Download Receipt
                  </Button>
                  <Button
                    className="flex-1 h-[48px] rounded-xl text-[14px] font-bold text-white border-0 hover:opacity-90 transition-all"
                    style={{
                      background:
                        "linear-gradient(135deg, #D4820A 0%, #B86010 100%)",
                    }}
                    onClick={() => router.push("/home")}
                  >
                    Back to Home
                  </Button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </AppShell>
    );
  }
  if (isArchana) {
    const amount = fixedAmount;

    return (
      <AppShell title="Archana Screen">
        <div className="min-h-screen bg-[#f5efe6] p-6">
          <div className="mx-auto flex max-w-[1024px] overflow-hidden rounded-[30px] bg-white shadow-xl">
            <div className="w-[40%] bg-gradient-to-b from-[#cf6527] to-[#db9900] p-10 text-white">
              <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-3xl border border-white/40 bg-white/20 text-4xl">
                🧴
              </div>

              <h1 className="text-3xl font-bold">{offeringName}</h1>
              <p className="mt-3 text-lg">{offeringDesc}</p>

              <div className="my-9 border-t border-white/20" />

              <p className="text-xs font-bold uppercase tracking-wide">
                Fixed Offering
              </p>
              <h2 className="mt-2 text-5xl font-bold">₹{amount}</h2>

              <div className="mt-3 inline-flex items-center gap-2 rounded-xl border border-white/40 px-4 py-2 text-xs font-bold">
                <Lock size={14} />
                Price Locked
              </div>

              <div className="mt-8 rounded-2xl border border-white/25 bg-white/10 p-5 text-sm font-semibold leading-6">
                Archana will be performed by the temple priest on your behalf.
              </div>
            </div>

            <div className="w-[60%] p-11">
              <h2 className="text-3xl font-bold text-black">
                Confirm your Archana
              </h2>

              <p className="mt-3 text-[#7a6248]">
                {templeName} · {templeLocation}
              </p>

              <h3 className="mt-10 font-bold">Sankalpam Details</h3>

              <div className="mt-6">
                <input
                  value={devoteeName}
                  onChange={(e) => setDevoteeName(e.target.value)}
                  placeholder="Enter devotee name"
                  className="mt-2 w-full rounded-xl border border-[#cbb896] bg-[#f8f0e3] px-4 py-4 font-bold outline-none"
                />
              </div>

              <div className="mt-5 grid grid-cols-2 gap-5">
                <div>
                  <label className="mt-10 font-bold">Nakshatra</label>

                  <input
                    value={nakshatra}
                    onChange={(e) => setNakshatra(e.target.value)}
                    placeholder="e.g. Rohini"
                    className="mt-2 w-full rounded-xl border border-[#cbb896] bg-[#f8f0e3] px-4 py-4 outline-none"
                  />
                </div>

                <div>
                  <label className="mt-10 font-bold">Gotra</label>

                  <input
                    value={gotra}
                    onChange={(e) => setGotra(e.target.value)}
                    placeholder="e.g. Bharadwaja"
                    className="mt-2 w-full rounded-xl border border-[#cbb896] bg-[#f8f0e3] px-4 py-4 outline-none"
                  />
                </div>
              </div>

              <div className="mt-5">
                <label className="text-sm font-bold">Date of Archana</label>

                <DatePicker
                  value={offeringDate}
                  placeholder="Select archana date"
                  minDate={new Date().toISOString().split("T")[0]}
                  onChange={setOfferingDate}
                />
              </div>

              <div className="mt-5 rounded-2xl border border-[#dfc9a5] bg-[#f8f0e3] p-5">
                <div className="flex justify-between text-lg font-bold">
                  <span>Archana Fee</span>
                  <span className="text-[#cf5d25]">₹{amount}</span>
                </div>
              </div>

              <div className="mt-8 border-t border-[#dfc9a5] pt-6">
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="rounded-xl border border-[#cbb896] px-9 py-4 font-bold text-[#7a6248]"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handlePayment}
                    className="rounded-xl bg-gradient-to-r from-[#cf5d25] to-[#db9900] px-10 py-4 font-bold text-white shadow-lg"
                  >
                    Confirm & Proceed to Pay
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Donation Screen">
      <div
        className="min-h-screen bg-[#F5F0E8]"
        style={{ fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif" }}
      >
        <main className="px-12 py-6 flex justify-center">
          <div className="w-full max-w-[1100px]">
            <Card className="rounded-3xl border border-[#E8E0D2] shadow-sm overflow-hidden bg-white p-0">
              <CardContent className="p-0">
                <div className="flex min-h-[600px]">
                  {/* LEFT PANEL */}
                  <div className="w-[300px] flex-shrink-0 bg-[#F7F2EA] p-8 flex flex-col gap-6 border-r border-[#EDE8DF]">
                    <div
                      className="h-[190px] w-full flex-shrink-0 overflow-hidden rounded-2xl"
                      style={{ background: DEFAULT_GRADIENT }}
                    >
                      {isFestival && festivalImagePreviewUrl ? (
                        <img
                          src={festivalImagePreviewUrl}
                          alt={festivalName || "Festival"}
                          className="h-full w-full object-cover"
                        />
                      ) : templeImage ? (
                        <img
                          src={templeImage}
                          alt={templeName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm text-white/80">
                          No Image
                        </div>
                      )}
                    </div>
                    <div>
                      <h2 className="text-[19px] font-bold text-[#1A0F00] leading-snug">
                        {templeName}
                      </h2>
                      <div className="flex items-center gap-1.5 mt-2">
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#9C7E5A"
                          strokeWidth="2"
                        >
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        <span className="text-[13px] text-[#9C7E5A]">
                          {templeLocation}
                        </span>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-[#EDE8DF] p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 rounded-full bg-[#F5EFE6] flex items-center justify-center text-lg">
                          🙏
                        </div>
                        <span className="text-[17px] font-bold text-[#1A0F00]">
                          {offeringName}
                        </span>
                      </div>
                      <p className="text-[13px] text-[#7A6248] leading-relaxed">
                        {offeringDesc}
                      </p>
                    </div>
                  </div>

                  {/* RIGHT PANEL */}
                  <div className="flex-1 px-10 py-10 flex flex-col bg-white">
                    <h2 className="text-[28px] font-bold text-[#1A0F00] mb-8 tracking-tight">
                      Complete your Offering
                    </h2>

                    <p className="text-[14px] font-semibold text-[#1A0F00] mb-3">
                      Select Amount
                    </p>

                    <div className="mb-3 flex flex-wrap gap-3">
                      {PRESET_AMOUNTS.map((amt) => (
                        <Button
                          key={amt}
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setSelectedAmount(amt);
                            setCustomAmount("");
                            setAmountError("");
                          }}
                          className={`h-[48px] min-w-[88px] rounded-lg border-[1.5px] px-5 text-[15px] font-semibold transition-all duration-150 ${
                            selectedAmount === amt && !customAmount
                              ? "border-[#C8773A] bg-[#C8773A] text-white hover:border-[#B8672A] hover:bg-[#B8672A] hover:text-white"
                              : "border-[#D4C4A8] bg-white text-[#1A0F00] hover:border-[#C8773A] hover:bg-white hover:text-[#C8773A]"
                          }`}
                        >
                          ₹{amt}
                        </Button>
                      ))}
                    </div>

                    <div className="mb-6">
                      <div className="relative w-full max-w-[560px]">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9C7E5A] text-[16px] font-medium pointer-events-none">
                          ₹
                        </span>
                        <Input
                          type="text"
                          inputMode="numeric"
                          placeholder="Custom Amount"
                          value={customAmount}
                          onChange={handleCustomAmountChange}
                          className={`h-[54px] w-full rounded-lg border-[1.5px] bg-[#FAF7F2] pl-10 pr-4 text-[14px] text-[#1A0F00] placeholder:text-[#B0967A] focus-visible:ring-0 ${
                            amountError
                              ? "border-[#E53935] focus-visible:border-[#E53935]"
                              : "border-[#D4C4A8] focus-visible:border-[#C8773A]"
                          }`}
                        />
                      </div>
                      {amountError ? (
                        <p className="mt-1.5 text-[12px] font-medium text-[#E53935]">
                          {amountError}
                        </p>
                      ) : (
                        <p className="mt-1.5 text-[12px] text-[#8A6A45]">
                          <span className="font-medium text-[#C8773A]">*</span>{" "}
                          Minimum donation amount is{" "}
                          <span className="font-semibold">₹100</span>.
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-auto">
                      <div>
                        <p className="mb-2 text-[14px] font-semibold text-[#1A0F00]">
                          Date of Offering
                        </p>

                        <div className="donation-date-picker">
                          <DatePicker
                            value={offeringDate}
                            placeholder="Select offering date"
                            minDate={new Date().toISOString().split("T")[0]}
                            onChange={setOfferingDate}
                          />
                        </div>
                      </div>
                      <div>
                        <p className="text-[14px] font-semibold text-[#1A0F00] mb-2">
                          Devotee Name (Sankalpam)
                        </p>
                        <Input
                          value={devoteeName}
                          onChange={(e) => setDevoteeName(e.target.value)}
                          className="h-[52px] rounded-lg border-[1.5px] border-[#D4C4A8] bg-[#FAF7F2] px-4 text-[14px] text-[#1A0F00] shadow-none focus-visible:border-[#C8773A] focus-visible:ring-0"
                        />
                      </div>
                    </div>

                    <div className="mt-8">
                      <Separator className="mb-6 bg-[#EDE8DF]" />
                      <div className="flex justify-end gap-4">
                        {" "}
                        <Button
                          variant="outline"
                          className="h-[54px] min-w-[180px] rounded-lg border-[1.5px] border-[#D4C4A8] bg-[#FAF7F2] px-8 text-[16px] font-semibold text-[#1A0F00] transition hover:border-[#C8773A] hover:bg-[#FFF7EF]"
                        >
                          Back to Temple
                        </Button>
                        <Button
                          onClick={handlePayment}
                          disabled={
                            !!amountError || finalAmount < 100 || isLoading
                          }
                          className="h-[54px] min-w-[300px] rounded-lg bg-[#C8773A] px-8 text-[16px] font-semibold text-white shadow-lg transition hover:bg-[#B8672A]"
                          style={{
                            background:
                              "linear-gradient(135deg, #D4820A 0%, #B86010 100%)",
                            boxShadow: "0 4px 16px rgba(180, 90, 20, 0.3)",
                          }}
                        >
                          {isLoading
                            ? "Processing..."
                            : `Confirm & Pay ₹${finalAmount >= 100 ? finalAmount.toLocaleString("en-IN") : "—"}`}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </AppShell>
  );
}

export default function DonationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F5F0E8]" />}>
      <DonationPageInner />
    </Suspense>
  );
}
