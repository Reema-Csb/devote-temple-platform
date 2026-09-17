"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AdminShell from "@/components/layout/AdminShell";
import {
  useGetTransactionsQuery,
  useGetPendingPayoutQuery,
  useGetPayoutsQuery,
  useMarkPayoutPaidMutation,
} from "@/store/api/paymentApi";
import {
  ArrowLeft,
  Edit,
  Plus,
  MoreVertical,
  Trash2,
  Pencil,
  Gift,
  ChevronDown,
  Check,
} from "lucide-react";

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL;

async function getPresignedImageUrl(image?: string) {
  if (!image) return "";

  let imageKey = image;

  if (image.startsWith("https://s3.amazonaws.com/devotee-app-assets/")) {
    imageKey = image.replace(
      "https://s3.amazonaws.com/devotee-app-assets/",
      "",
    );
  }

  if (!imageKey.startsWith("temples/")) {
    return image;
  }

  const response = await fetch(
    `${API_GATEWAY_URL}/upload/presigned-url?key=${encodeURIComponent(imageKey)}`,
  );

  if (!response.ok) return "";

  const data = await response.json();
  return data.url ?? "";
}
const API_URL =
  process.env.NEXT_PUBLIC_TEMPLE_API_URL ?? "http://127.0.0.1:3001";

type Temple = {
  id: string;
  name: string;
  description?: string;
  deity?: string;
  isActive?: boolean;
  createdOn?: string;
  imageUrl?: string;
  imageUrls?: string[];
  image?: string;
};

type Location = {
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
};

type Offering = {
  id: string;
  name: string;
  description?: string;
  price?: number;
  currency?: string;
  archana?: boolean;
  isActive?: boolean;
  categories?: string[];
};

type BankReference = {
  templeId?: string;
  beneficiaryName?: string;
  accountNumber?: string;
  ifscCode?: string;
  accountType?: string;
  panNumber?: string;
  gstin?: string;
  payoutSchedule?: string;
  razorpayContactId?: string;
  razorpayFundAccountId?: string;
  verificationStatus?: string;
  status?: string;
};
type RazorpayBankDetails = {
  bank_account?: {
    name?: string;
    bank_name?: string;
    ifsc?: string;
    account_number?: string;
    account_type?: string;
  };
};
const offeringCategories = [
  "Health",
  "Wealth",
  "Marriage",
  "Studies",
  "Protection",
  "Peace",
  "Removing Obstacles",
  "Business",
  "Family",
  "Devotion",
];

export default function AdminTempleDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchTempleId = searchParams.get("id");

  const [adminRole, setAdminRole] = useState<string | null>(null);
  const [assignedTempleId, setAssignedTempleId] = useState<string | null>(null);

  const [isOfferingTypeOpen, setIsOfferingTypeOpen] = useState(false);

  const templeId =
    adminRole === "temple_admin" ? assignedTempleId : searchTempleId;
  console.log("Temple ID:", templeId);

  const normalizedRole = adminRole?.toLowerCase();

  const isSuperAdmin =
    normalizedRole === "super_admin" ||
    normalizedRole === "superadmin" ||
    normalizedRole === "super admin" ||
    normalizedRole === "admin";

  const isTempleAdmin = normalizedRole === "temple_admin";
  const { data: transactions = [] } = useGetTransactionsQuery();

  const { data: pendingPayout, refetch: refetchPendingPayout } =
    useGetPendingPayoutQuery(templeId ?? "", {
      skip: !templeId,
    });

  const { data: payouts = [], refetch: refetchPayouts } = useGetPayoutsQuery();

  const [markPayoutPaid, { isLoading: payoutLoading }] =
    useMarkPayoutPaidMutation();

  const [temple, setTemple] = useState<Temple | null>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [bankReference, setBankReference] = useState<BankReference | null>(
    null,
  );
  const [showBankModal, setShowBankModal] = useState(false);
  const [showBankRequestModal, setShowBankRequestModal] = useState(false);
  const [razorpayBankDetails, setRazorpayBankDetails] =
    useState<RazorpayBankDetails | null>(null);
  const [bankForm, setBankForm] = useState({
    beneficiaryName: "Enter Name",
    accountNumber: "0000000000",
    confirmAccountNumber: "00000000",
    ifscCode: "IFSC CODE",
    accountType: "Savings",
    panNumber: "ABCDE1234F",
    gstin: "GST NUMBER",
    payoutSchedule: "Daily",
  });

  const TEST_SUPER_ADMIN_EMAIL = "reema4040.csbs@nehrucolleges.com";

  const [bankRequestForm, setBankRequestForm] = useState({
    beneficiaryName: "",
    accountNumber: "",
    confirmAccountNumber: "",
    ifscCode: "",
    accountType: "",
    panNumber: "",
    gstin: "",
    superAdminEmail: TEST_SUPER_ADMIN_EMAIL,
  });

  const [loading, setLoading] = useState(true);
  const [isSubmittingBankRequest, setIsSubmittingBankRequest] = useState(false);
  const [isSavingBankDetails, setIsSavingBankDetails] = useState(false);
  const [openOfferingMenu, setOpenOfferingMenu] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [showOfferingModal, setShowOfferingModal] = useState(false);
  const [editingOfferingId, setEditingOfferingId] = useState<string | null>(
    null,
  );

  const [newOffering, setNewOffering] = useState({
    name: "",
    description: "",
    price: "",
    archana: false,
    isActive: true,
    categories: [] as string[],
  });

  const handleBankChangeRequest = async () => {
    if (!templeId) return;

    if (
      bankRequestForm.accountNumber !== bankRequestForm.confirmAccountNumber
    ) {
      alert("Account numbers do not match");
      return;
    }

    try {
      setIsSubmittingBankRequest(true);

      const response = await fetch(
        `${API_GATEWAY_URL}/temple-bank-details/request-change`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            templeId,
            beneficiaryName: bankRequestForm.beneficiaryName,
            accountNumber: bankRequestForm.accountNumber,
            confirmAccountNumber: bankRequestForm.confirmAccountNumber,
            ifscCode: bankRequestForm.ifscCode,
            accountType: bankRequestForm.accountType,
            panNumber: bankRequestForm.panNumber,
            gstin: bankRequestForm.gstin,
            superAdminEmail: bankRequestForm.superAdminEmail,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error?.message || data?.message);
      }

      alert(
        "Bank details change request sent successfully to the Super Admin.",
      );

      setShowBankRequestModal(false);
    } catch (error) {
      console.error(error);
      alert("Failed to submit bank details request.");
    } finally {
      setIsSubmittingBankRequest(false);
    }
  };

  useEffect(() => {
    const role = sessionStorage.getItem("adminRole");
    const storedTempleId = sessionStorage.getItem("templeId");

    setAdminRole(role);
    setAssignedTempleId(storedTempleId);
  }, []);
  const templeTransactions = transactions.filter(
    (tx) => tx.templeId === templeId,
  );

  const successfulTempleTransactions = templeTransactions.filter(
    (tx) => tx.status === "Success" || tx.paymentStatus === "success",
  );
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const activeDevotees = new Set(
    successfulTempleTransactions
      .filter((tx) => {
        const date = new Date(tx.paymentDate || tx.createdOn || "");
        return !Number.isNaN(date.getTime()) && date >= thirtyDaysAgo;
      })
      .map((tx) => tx.userId)
      .filter(Boolean),
  ).size;
  const donationCount = successfulTempleTransactions.filter((tx) => {
    const offering = offerings.find((item) => item.id === tx.offeringId);
    return !tx.offeringId || offering?.archana === false;
  }).length;

  const archanaCount = successfulTempleTransactions.filter((tx) => {
    const offering = offerings.find((item) => item.id === tx.offeringId);
    return offering?.archana === true;
  }).length;

  const totalRevenue = successfulTempleTransactions.reduce(
    (sum, tx) => sum + Number(tx.amount || 0),
    0,
  );

  const totalTransactions = successfulTempleTransactions.length;
  const minimumDonation =
    successfulTempleTransactions.length > 0
      ? Math.min(
          ...successfulTempleTransactions.map((tx) => Number(tx.amount || 0)),
        )
      : 0;

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const paidThisMonth = payouts
    .filter((payout) => {
      const date = new Date(payout.paidOn || "");
      return (
        payout.templeId === templeId &&
        payout.payoutStatus === "paid" &&
        !Number.isNaN(date.getTime()) &&
        date.getMonth() === currentMonth &&
        date.getFullYear() === currentYear
      );
    })
    .reduce((sum, payout) => sum + Number(payout.payoutAmount || 0), 0);

  const totalPayoutReceived = payouts
    .filter(
      (payout) =>
        payout.templeId === templeId && payout.payoutStatus === "paid",
    )
    .reduce((sum, payout) => sum + Number(payout.payoutAmount || 0), 0);

  const totalCommissionRevenue = payouts
    .filter(
      (payout) =>
        payout.templeId === templeId && payout.payoutStatus === "paid",
    )
    .reduce(
      (sum, payout) => sum + Number(payout.platformCommissionAmount || 0),
      0,
    );

  const recentPayouts = payouts
    .filter((payout) => payout.templeId === templeId)
    .sort((a, b) => {
      const dateA = new Date(a.paidOn || "").getTime();
      const dateB = new Date(b.paidOn || "").getTime();
      return dateB - dateA;
    })
    .slice(0, 5);

  const formatINR = (amount: number) =>
    `₹${Number(amount || 0).toLocaleString("en-IN")}`;

  const openBankModal = () => {
    setBankForm({
      beneficiaryName:
        razorpayBankDetails?.bank_account?.name ??
        bankReference?.beneficiaryName ??
        "",
      accountNumber:
        razorpayBankDetails?.bank_account?.account_number ??
        bankReference?.accountNumber ??
        "",
      confirmAccountNumber:
        razorpayBankDetails?.bank_account?.account_number ??
        bankReference?.accountNumber ??
        "",
      ifscCode:
        razorpayBankDetails?.bank_account?.ifsc ??
        bankReference?.ifscCode ??
        "",
      accountType: bankReference?.accountType ?? "Savings",
      panNumber: bankReference?.panNumber ?? "",
      gstin: bankReference?.gstin ?? "",
      payoutSchedule: bankReference?.payoutSchedule ?? "Daily",
    });
    setShowBankModal(true);
  };

  const handleSaveBankDetails = async () => {
    if (!templeId) {
      alert("Temple ID is missing.");
      return;
    }

    if (!bankForm.beneficiaryName.trim()) {
      alert("Please enter the beneficiary name.");
      return;
    }

    if (!bankForm.accountNumber.trim()) {
      alert("Please enter the account number.");
      return;
    }

    if (
      bankForm.accountNumber.trim() !== bankForm.confirmAccountNumber.trim()
    ) {
      alert("Account numbers do not match.");
      return;
    }

    if (!bankForm.ifscCode.trim()) {
      alert("Please enter the IFSC code.");
      return;
    }

    if (!bankForm.panNumber.trim()) {
      alert("Please enter the PAN number.");
      return;
    }

    try {
      setIsSavingBankDetails(true);

      const response = await fetch(
        `${API_GATEWAY_URL}/temple-bank-details/update`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            templeId,
            beneficiaryName: bankForm.beneficiaryName.trim(),
            accountNumber: bankForm.accountNumber.trim(),
            confirmAccountNumber: bankForm.confirmAccountNumber.trim(),
            ifscCode: bankForm.ifscCode.trim().toUpperCase(),
            accountType: bankForm.accountType,
            panNumber: bankForm.panNumber.trim().toUpperCase(),
            gstin: bankForm.gstin.trim()
              ? bankForm.gstin.trim().toUpperCase()
              : undefined,
            payoutSchedule: bankForm.payoutSchedule,
          }),
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.error?.message ??
            data?.message ??
            "Failed to update bank details",
        );
      }

      alert(
        "Bank details updated successfully. A new Razorpay fund account was created.",
      );

      setShowBankModal(false);

      await fetchTempleDetails();
    } catch (error) {
      console.error("Save bank details error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to update bank details.",
      );
    } finally {
      setIsSavingBankDetails(false);
    }
  };

  const handleDeleteTemple = async () => {
    if (!templeId) return;

    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this temple?",
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`${API_URL}/temples/${templeId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete temple");
      }

      alert("Temple permanently deleted");
      router.push("/");
    } catch (error) {
      console.error("Delete temple error:", error);
      alert("Failed to delete temple");
    }
  };

  const handleTempleStatusToggle = async () => {
    if (!templeId || !temple) return;

    try {
      const response = await fetch(`${API_URL}/temples/${templeId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isActive: !(temple.isActive !== false),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update temple status");
      }

      await fetchTempleDetails();
    } catch (error) {
      console.error("Temple status update error:", error);
      alert("Failed to update temple status");
    }
  };

  const fetchTempleDetails = async () => {
    if (!templeId) return;

    try {
      setLoading(true);

      const templeRes = await fetch(`${API_URL}/temples/${templeId}`);
      const templeData = await templeRes.json();
      const imageRes = await fetch(
        `${API_URL}/temple-images?filter=${encodeURIComponent(
          JSON.stringify({ where: { templeId } }),
        )}`,
      );

      const imageData = imageRes.ok ? await imageRes.json() : [];
      const imageKey = Array.isArray(imageData) ? imageData[0]?.imageUrl : "";

      const signedImage = await getPresignedImageUrl(imageKey);

      setTemple({
        ...templeData,
        image: signedImage,
      });
      const locationRes = await fetch(
        `${API_URL}/temple-locations?filter=${encodeURIComponent(
          JSON.stringify({ where: { templeId } }),
        )}`,
      );
      const locationData = await locationRes.json();
      setLocation(Array.isArray(locationData) ? locationData[0] : null);

      const offeringRes = await fetch(
        `${API_URL}/temple-offerings?filter=${encodeURIComponent(
          JSON.stringify({ where: { templeId } }),
        )}`,
      );
      const offeringData = await offeringRes.json();
      setOfferings(Array.isArray(offeringData) ? offeringData : []);
      const bankRes = await fetch(`${API_URL}/temple-bank-details/${templeId}`);
      if (bankRes.ok) {
        const bankData = await bankRes.json();

        if (bankData) {
          setBankReference(bankData.bankReference ?? bankData);
          setRazorpayBankDetails(bankData.razorpayBankDetails ?? null);
        } else {
          setBankReference(null);
          setRazorpayBankDetails(null);
        }
      }
    } catch (error) {
      console.error("Failed to fetch temple details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!templeId) return;
    fetchTempleDetails();
  }, [templeId]);

  if (!templeId) {
    return (
      <AdminShell title="My Temple">
        <div className="p-6">No temple assigned to this admin.</div>
      </AdminShell>
    );
  }

  if (loading) {
    return <div className="p-6">Loading temple details...</div>;
  }

  if (!temple) {
    return <div className="p-6">Temple not found</div>;
  }

  function maskAccountNumber(accountNumber?: string): string {
    if (!accountNumber) return "Not available";

    return `XXXX XXXX ${accountNumber.slice(-4)}`;
  }

  const handleSendPayoutNow = async () => {
    if (!templeId) return;

    const confirmed = window.confirm(
      "Are you sure you want to mark this payout as paid?",
    );

    if (!confirmed) return;

    try {
      const response = await markPayoutPaid({
        templeId,
        remarks: "Manual payout from admin",
      }).unwrap();

      if (!response.success) {
        alert(response.message ?? "No pending payout found");
        return;
      }

      await refetchPendingPayout();
      await refetchPayouts();

      alert("Payout marked as paid successfully");
    } catch (error) {
      console.error("Payout error:", error);
      alert("Failed to send payout");
    }
  };

  return (
    <AdminShell
      title={adminRole === "temple_admin" ? "My Temple" : "Temple Detail"}
    >
      {" "}
      <main className="min-h-screen bg-[#f8f1e7] p-6 text-[#2d1606]">
        {/* TOP */}
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() =>
                adminRole === "temple_admin"
                  ? router.push("/dashboard")
                  : router.push("/temple")
              }
              className="rounded-lg border border-[#E5D5B5] bg-white p-2"
            >
              <ArrowLeft size={18} />
            </button>

            <div>
              <h1 className="text-2xl font-bold">{temple.name}</h1>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleTempleStatusToggle}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                temple.isActive
                  ? "border border-red-200 bg-red-50 text-red-600"
                  : "border border-green-200 bg-green-50 text-green-600"
              }`}
            >
              {temple.isActive ? "Disable" : "Enable"}
            </button>

            <button
              onClick={() => router.push(`/create?id=${temple.id}`)}
              className="flex items-center gap-2 rounded-lg bg-[#C8602A] px-4 py-2 text-sm font-semibold text-white"
            >
              <Edit size={16} />
              Edit Temple
            </button>
          </div>
        </div>

        {/* HERO */}
        <section className="mb-5 overflow-hidden rounded-2xl border border-[#E5D5B5] bg-white shadow-sm">
          <div className="relative h-56 bg-gradient-to-r from-[#81360f] to-[#211204]">
            <span
              className={`absolute right-5 top-5 rounded-full px-4 py-1 text-sm font-semibold ${
                temple.isActive
                  ? "bg-green-500 text-white"
                  : "bg-gray-300 text-gray-700"
              }`}
            >
              ● {temple.isActive !== false ? "Active" : "Inactive"}
            </span>
          </div>

          <div className="relative flex min-h-[112px] items-center justify-between px-8 py-7">
            {/* Small Image Box */}
            <div className="absolute -top-9 left-8 flex h-28 w-28 items-center justify-center rounded-2xl border-4 border-white bg-gradient-to-br from-[#e7a21a] to-[#c8641f] text-4xl shadow-lg">
              {temple.image ? (
                <img
                  src={temple.image}
                  alt={temple.name}
                  className="h-full w-full rounded-xl object-cover"
                />
              ) : (
                <span>🛕</span>
              )}
            </div>

            <div className="ml-36">
              <p className="text-sm text-[#8B7355]">Primary Deity</p>
              <h2 className="text-xl font-bold text-[#2d1606]">
                {temple.deity || "-"}
              </h2>
            </div>

            <div className="text-right">
              <p className="text-sm text-[#8B7355]">Location</p>
              <h2 className="text-xl font-bold text-[#2d1606]">
                {location?.city || "-"}, {location?.state || "-"}
              </h2>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="mb-5 grid gap-4 md:grid-cols-4">
          <Stat title="Total Offerings" value={offerings.length} />

          {isSuperAdmin ? (
            <>
              <Stat
                title="Payout Sent"
                value={formatINR(totalPayoutReceived)}
              />

              <Stat title="Transactions" value={totalTransactions} />

              <Stat title="Revenue" value={formatINR(totalCommissionRevenue)} />
            </>
          ) : (
            <>
              <Stat
                title="Payout Received"
                value={formatINR(totalPayoutReceived)}
              />

              <Stat title="Transactions" value={totalTransactions} />

              <Stat
                title="Minimum Donation"
                value={formatINR(minimumDonation)}
              />
            </>
          )}
        </section>

        {/* INFO */}
        <section className="mb-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-[#E5D5B5] bg-white p-5 md:col-span-2">
            <h3 className="mb-3 font-bold">Temple Information</h3>

            <div className="mb-5 text-sm leading-7 text-[#5f4a32]">
              {temple.description ? (
                <div
                  dangerouslySetInnerHTML={{
                    __html: temple.description,
                  }}
                />
              ) : (
                "No description available."
              )}
            </div>

            <div className="grid gap-5 border-t border-[#E5D5B5] pt-4 md:grid-cols-2">
              <div>
                <p className="text-xs text-[#8B7355]">Address</p>
                <p className="font-semibold">{location?.addressLine1 || "-"}</p>
                <p className="text-sm">
                  {location?.city}, {location?.state}
                </p>
                <p className="text-sm">{location?.country}</p>
              </div>

              <div>
                <p className="mt-3 text-xs text-[#8B7355]">Listed On Devote</p>
                <p className="font-semibold">
                  {temple.createdOn
                    ? new Date(temple.createdOn).toLocaleDateString()
                    : "-"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#E5D5B5] bg-white p-5">
            <h3 className="mb-4 font-bold">Quick Stats</h3>
            <QuickStat label="Donations" value={String(donationCount)} />
            <QuickStat label="Archanas" value={String(archanaCount)} />
            <QuickStat
              label="This Month Revenue"
              value={formatINR(paidThisMonth)}
              green
            />
          </div>
        </section>

        {/* BANK & PAYOUT DASHBOARD */}
        {/* BANK & PAYOUT */}
        <section className="mb-5 grid gap-4 md:grid-cols-3">
          {/* LEFT CARD */}
          <div className="rounded-2xl border border-[#E5D5B5] bg-white p-5 md:col-span-2">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h3 className="flex items-center gap-2 font-bold">
                  🏦 Bank & Payout Details
                </h3>
                <p className="mt-1 text-sm text-[#8B7355]">
                  Connected to Razorpay vendor account
                </p>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  bankReference?.verificationStatus === "verified"
                    ? "bg-green-100 text-green-600"
                    : "bg-orange-100 text-orange-600"
                }`}
              >
                ●{" "}
                {bankReference?.verificationStatus === "verified"
                  ? "Verified"
                  : "Pending"}
              </span>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <PayoutInfo
                label="Beneficiary"
                value={
                  razorpayBankDetails?.bank_account?.name ??
                  bankReference?.beneficiaryName ??
                  "Not available"
                }
              />

              <PayoutInfo
                label="Razorpay Contact ID"
                value={bankReference?.razorpayContactId ?? "Not available"}
              />

              <PayoutInfo
                label="Razorpay Fund Account ID"
                value={bankReference?.razorpayFundAccountId ?? "Not available"}
              />

              <PayoutInfo
                label="Bank Name"
                value={
                  razorpayBankDetails?.bank_account?.bank_name ??
                  "Not available"
                }
              />

              <PayoutInfo
                label="IFSC"
                value={
                  razorpayBankDetails?.bank_account?.ifsc ?? "Not available"
                }
              />

              <PayoutInfo
                label="Account Number"
                value={maskAccountNumber(
                  razorpayBankDetails?.bank_account?.account_number,
                )}
              />

              <PayoutInfo
                label="Payout Schedule"
                value={bankReference?.payoutSchedule ?? "Not available"}
              />

              <PayoutInfo
                label="Status"
                value={bankReference?.verificationStatus ?? "Pending"}
              />

              <PayoutInfo
                label="Bank Change Request"
                value={
                  bankReference?.status === "requested"
                    ? "Requested"
                    : bankReference?.status === "updated"
                      ? "Updated"
                      : (bankReference?.status ?? "No request")
                }
              />
            </div>

            <div className="my-5 border-t border-[#E5D5B5]" />

            <div className="grid gap-5 md:grid-cols-3">
              <div>
                <p className="text-xs text-[#8B7355]">Pending Payout</p>
                <p className="text-2xl font-bold">
                  {formatINR(Number(pendingPayout?.payoutAmount || 0))}
                </p>
                <p className="text-sm text-[#8B7355]">
                  From {pendingPayout?.transactionCount ?? 0} transactions
                </p>
              </div>

              <div>
                <p className="text-xs text-[#8B7355]">Paid This Month</p>
                <p className="text-2xl font-bold">{formatINR(paidThisMonth)}</p>
                <p className="text-sm text-[#8B7355]">
                  {recentPayouts.length} Payout this month
                </p>
              </div>

              <div className="flex flex-col gap-2">
                {isSuperAdmin && (
                  <>
                    <button
                      type="button"
                      disabled={
                        payoutLoading ||
                        Number(pendingPayout?.payoutAmount || 0) <= 0
                      }
                      onClick={handleSendPayoutNow}
                      className="rounded-xl bg-green-500 py-2.5 text-sm font-semibold text-white hover:bg-green-600 disabled:cursor-not-allowed disabled:bg-gray-300"
                    >
                      {payoutLoading ? "Processing..." : "Send Payout Now"}
                    </button>

                    <button
                      type="button"
                      onClick={openBankModal}
                      className="rounded-xl border border-[#E5D5B5] py-2.5 text-sm font-semibold text-[#8B7355] hover:bg-[#f8f1e7]"
                    >
                      Edit Bank Details
                    </button>
                  </>
                )}

                {isTempleAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      setBankRequestForm({
                        beneficiaryName: "",
                        accountNumber: "",
                        confirmAccountNumber: "",
                        ifscCode: "",
                        accountType: "",
                        panNumber: "",
                        gstin: "",
                        superAdminEmail: TEST_SUPER_ADMIN_EMAIL,
                      });

                      setShowBankRequestModal(true);
                    }}
                    className="rounded-xl border border-[#dfc9a5] py-2.5 text-sm font-semibold text-[#8b6f47] hover:bg-[#f8f1e7]"
                  >
                    Request Bank Details Change
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT CARD */}
          <div className="rounded-2xl border border-[#E5D5B5] bg-white p-5">
            <h3 className="mb-4 font-bold">Recent Payouts</h3>

            {recentPayouts.map((tx) => {
              const date = new Date(tx.paidOn || "");

              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between border-b border-[#E5D5B5] py-3 last:border-0"
                >
                  <div>
                    <p className="font-bold">
                      {formatINR(Number(tx.payoutAmount || 0))}{" "}
                    </p>
                    <p className="text-xs text-[#8B7355]">{tx.id} </p>
                    <p className="text-xs text-[#8B7355]">
                      {tx.remarks ?? tx.payoutMethod ?? "Manual payout"}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-[#8B7355]">
                      {Number.isNaN(date.getTime())
                        ? "-"
                        : date.toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                          })}
                    </p>{" "}
                    <p
                      className={`text-xs font-semibold ${
                        (tx.payoutStatus ?? "pending") === "paid"
                          ? "text-green-600"
                          : "text-orange-500"
                      }`}
                    >
                      {tx.payoutStatus ?? "pending"}
                    </p>
                  </div>
                </div>
              );
            })}
            <button
              onClick={() => router.push(`/payouts?templeId=${templeId}`)}
              className="mt-4 w-full rounded-xl border border-[#C8602A] py-2.5 text-sm font-semibold text-[#C8602A] hover:bg-orange-50"
            >
              View All Payouts
            </button>
          </div>
        </section>

        {/* OFFERINGS */}
        <section className="rounded-2xl border border-[#E5D5B5] bg-white">
          <div className="flex items-center justify-between border-b border-[#E5D5B5] p-5">
            <div>
              <h3 className="font-bold">Offerings</h3>
              <p className="text-sm text-[#8B7355]">
                All donation packs and archana details for this temple
              </p>
            </div>

            <button
              onClick={() => {
                setEditingOfferingId(null);

                setNewOffering({
                  name: "",
                  description: "",
                  price: "",
                  archana: false,
                  isActive: true,
                  categories: [],
                });

                setShowOfferingModal(true);
              }}
              className="flex items-center gap-2 rounded-lg bg-[#C8602A] px-4 py-2 text-sm font-semibold text-white"
            >
              <Plus size={16} />
              Add Offering
            </button>
          </div>

          <table className="w-full text-left text-sm">
            <thead className="bg-[#f6eadb] text-xs uppercase text-[#8B7355]">
              <tr>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Price</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {offerings.map((offering) => (
                <tr key={offering.id} className="border-t border-[#E5D5B5]">
                  <td className="px-5 py-4">
                    <p className="font-semibold">{offering.name}</p>
                    <p className="text-xs text-[#8B7355]">
                      {offering.description}
                    </p>
                  </td>

                  <td className="px-5 py-4">
                    <span className="rounded-full bg-orange-50 px-3 py-1 text-xs text-[#C8602A]">
                      {offering.archana ? "Archana" : "Donation"}
                    </span>
                  </td>

                  <td className="px-5 py-4 font-semibold">
                    {offering.price ? `₹${offering.price}` : "Variable"}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs ${
                        offering.isActive !== false
                          ? "bg-green-50 text-green-600"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {offering.isActive !== false ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td className="relative px-5 py-4 text-right">
                    <button
                      onClick={() =>
                        setOpenOfferingMenu(
                          openOfferingMenu === offering.id ? null : offering.id,
                        )
                      }
                      className="rounded-lg p-2 hover:bg-[#f5eee4]"
                    >
                      <MoreVertical size={18} />
                    </button>

                    {openOfferingMenu === offering.id && (
                      <div className="absolute right-5 top-12 z-20 w-40 overflow-hidden rounded-xl border border-[#E5D5B5] bg-white shadow-lg">
                        {/* EDIT */}
                        <button
                          onClick={() => {
                            setOpenOfferingMenu(null);

                            setEditingOfferingId(offering.id);

                            setNewOffering({
                              name: offering.name ?? "",
                              description: offering.description ?? "",
                              price: String(offering.price ?? ""),
                              archana: offering.archana ?? false,
                              isActive: offering.isActive !== false,
                              categories: offering.categories ?? [],
                            });

                            setShowOfferingModal(true);
                          }}
                          className="flex w-full items-center gap-3 px-4 py-3 text-sm hover:bg-[#f8f3eb]"
                        >
                          <Pencil size={16} />
                          Edit Offering{" "}
                        </button>

                        {/* REMOVE */}
                        <button
                          onClick={async () => {
                            setOpenOfferingMenu(null);

                            const confirmed = window.confirm(
                              `Are you sure you want to delete "${offering.name}"?`,
                            );

                            if (!confirmed) return;

                            try {
                              const deleteRes = await fetch(
                                `${API_URL}/temple-offerings/${offering.id}`,
                                {
                                  method: "DELETE",
                                },
                              );

                              if (!deleteRes.ok) {
                                const errorText = await deleteRes.text();
                                console.error(
                                  "Delete offering failed:",
                                  errorText,
                                );
                                throw new Error("Failed to delete offering");
                              }

                              await fetchTempleDetails();

                              alert("Offering deleted successfully");
                            } catch (error) {
                              console.error("Delete offering error:", error);
                              alert("Failed to delete offering");
                            }
                          }}
                          className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                          Remove Offering{" "}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        {showOfferingModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-5xl rounded-2xl border border-[#ead3aa] bg-[#fffaf2] p-6 shadow-xl">
              {/* Header */}
              <div className="mb-5 flex items-center justify-between">
                <p className="text-sm font-bold text-[#2d1606]">
                  {editingOfferingId ? "Edit Offering" : "Offering  "}
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setEditingOfferingId(null);
                    setShowOfferingModal(false);
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-xl font-semibold text-[#9b4815] transition hover:bg-[#f4eadb] hover:text-[#c8651d]"
                  aria-label="Close offering"
                >
                  ×
                </button>
              </div>

              {/* Name and Price */}
              <div
                className={`grid gap-4 ${
                  newOffering.archana
                    ? "md:grid-cols-[1fr_225px]"
                    : "md:grid-cols-1"
                }`}
              >
                {" "}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#2d1606]">
                    Name <span className="text-red-600">*</span>
                  </label>

                  <input
                    value={newOffering.name}
                    onChange={(e) =>
                      setNewOffering({
                        ...newOffering,
                        name: e.target.value,
                      })
                    }
                    placeholder="Archana"
                    className="h-12 w-full rounded-xl border border-[#d6b982] bg-white px-4 text-sm text-[#2d1606] outline-none placeholder:text-[#b9aa95] focus:border-[#c8651d]"
                  />
                </div>
                {newOffering.archana && (
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#2d1606]">
                      Amount <span className="text-red-600">*</span>
                    </label>

                    <div className="relative">
                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#7d6040]">
                        ₹
                      </span>

                      <input
                        type="text"
                        inputMode="numeric"
                        value={newOffering.price}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "");

                          setNewOffering({
                            ...newOffering,
                            price: value,
                          });
                        }}
                        placeholder="100"
                        className="h-12 w-full rounded-xl border border-[#d6b982] bg-white pl-9 pr-4 text-sm text-[#2d1606] outline-none placeholder:text-[#b9aa95] focus:border-[#c8651d]"
                      />
                    </div>

                    <p className="mt-1 text-xs font-medium text-[#9b4815]">
                      Minimum amount: ₹100
                    </p>
                  </div>
                )}
              </div>

              {/* Description and Offering Type */}
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#2d1606]">
                    Description <span className="text-red-600">*</span>
                  </label>

                  <input
                    value={newOffering.description}
                    onChange={(e) =>
                      setNewOffering({
                        ...newOffering,
                        description: e.target.value,
                      })
                    }
                    placeholder="Special pooja"
                    className="h-12 w-full rounded-xl border border-[#d6b982] bg-white px-4 text-sm text-[#2d1606] outline-none placeholder:text-[#b9aa95] focus:border-[#c8651d]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#2d1606]">
                    Offering Type <span className="text-red-600">*</span>
                  </label>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setIsOfferingTypeOpen((current) => !current)
                      }
                      className={`flex h-12 w-full items-center justify-between rounded-xl border bg-white px-4 text-left transition ${
                        isOfferingTypeOpen
                          ? "border-[#c8651d] ring-4 ring-[#c8651d]/10"
                          : "border-[#d6b982] hover:border-[#c89554]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Gift size={18} className="text-[#b56b32]" />

                        <span className="text-sm font-semibold text-[#2d1606]">
                          {newOffering.archana ? "Archana" : "Donation"}
                        </span>
                      </div>

                      <ChevronDown
                        size={19}
                        className={`text-[#765b3e] transition-transform ${
                          isOfferingTypeOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isOfferingTypeOpen && (
                      <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-xl border border-[#e5d8c5] bg-white p-2 shadow-xl">
                        <button
                          type="button"
                          onClick={() => {
                            setNewOffering({
                              ...newOffering,
                              archana: false,
                            });

                            setIsOfferingTypeOpen(false);
                          }}
                          className={`flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-sm transition ${
                            !newOffering.archana
                              ? "bg-[#fff1e7] font-semibold text-[#c05e20]"
                              : "text-[#493725] hover:bg-[#faf4eb]"
                          }`}
                        >
                          <div>
                            <p className="font-semibold">Donation</p>

                            <p className="mt-1 text-xs text-[#8a6a45]">
                              General donation offering
                            </p>
                          </div>

                          {!newOffering.archana && (
                            <Check size={17} className="text-[#c05e20]" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setNewOffering({
                              ...newOffering,
                              archana: true,
                            });

                            setIsOfferingTypeOpen(false);
                          }}
                          className={`mt-1 flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-sm transition ${
                            newOffering.archana
                              ? "bg-[#fff1e7] font-semibold text-[#c05e20]"
                              : "text-[#493725] hover:bg-[#faf4eb]"
                          }`}
                        >
                          <div>
                            <p className="font-semibold">Archana</p>

                            <p className="mt-1 text-xs text-[#8a6a45]">
                              Fixed-price temple seva
                            </p>
                          </div>

                          {newOffering.archana && (
                            <Check size={17} className="text-[#c05e20]" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Categories */}
              <div className="mt-5">
                <p className="mb-3 text-sm font-semibold text-[#7d6040]">
                  Categories (Purpose)
                </p>

                <div className="flex flex-wrap gap-2">
                  {offeringCategories.map((category) => {
                    const selected = newOffering.categories.includes(category);

                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() =>
                          setNewOffering({
                            ...newOffering,
                            categories: selected
                              ? newOffering.categories.filter(
                                  (item) => item !== category,
                                )
                              : [...newOffering.categories, category],
                          })
                        }
                        className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition ${
                          selected
                            ? "border-[#c8651d] bg-[#c8651d] text-white"
                            : "border-[#d6b982] bg-white text-[#7d6040] hover:border-[#c8651d]"
                        }`}
                      >
                        {category}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-7 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowOfferingModal(false)}
                  className="rounded-xl border border-[#d6b982] bg-white px-5 py-3 font-semibold text-[#7d6040] hover:border-[#c8651d]"
                >
                  Cancel
                </button>

                <button
                  onClick={async () => {
                    if (!templeId) return;

                    try {
                      if (editingOfferingId) {
                        const deleteRes = await fetch(
                          `${API_URL}/temple-offerings/${editingOfferingId}`,
                          {
                            method: "DELETE",
                          },
                        );

                        if (!deleteRes.ok) {
                          const errorText = await deleteRes.text();
                          console.error(
                            "Delete old offering failed:",
                            errorText,
                          );
                          throw new Error("Failed to delete old offering");
                        }

                        const createRes = await fetch(
                          `${API_URL}/temple-offerings`,
                          {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                              templeId,
                              name: newOffering.name,
                              description: newOffering.description,
                              price: Number(newOffering.price),
                              currency: "INR",
                              archana: newOffering.archana,
                              isActive: newOffering.isActive,
                            }),
                          },
                        );

                        if (!createRes.ok) {
                          const errorText = await createRes.text();
                          console.error(
                            "Create updated offering failed:",
                            errorText,
                          );
                          throw new Error("Failed to create updated offering");
                        }

                        const createdOffering = await createRes.json();

                        await Promise.all(
                          newOffering.categories.map((category) =>
                            fetch(`${API_URL}/offering-category-mappings`, {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                              },
                              body: JSON.stringify({
                                templeId,
                                offeringId: createdOffering.id,
                                categoryName: category,
                              }),
                            }),
                          ),
                        );
                      } else {
                        const offeringRes = await fetch(
                          `${API_URL}/temple-offerings`,
                          {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                              templeId,
                              name: newOffering.name,
                              description: newOffering.description,
                              price: Number(newOffering.price),
                              currency: "INR",
                              archana: newOffering.archana,
                              isActive: newOffering.isActive,
                            }),
                          },
                        );

                        if (!offeringRes.ok) {
                          throw new Error("Failed to add offering");
                        }

                        const createdOffering = await offeringRes.json();

                        await Promise.all(
                          newOffering.categories.map((category) =>
                            fetch(`${API_URL}/offering-category-mappings`, {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                              },
                              body: JSON.stringify({
                                templeId,
                                offeringId: createdOffering.id,
                                categoryName: category,
                              }),
                            }),
                          ),
                        );
                      }

                      await fetchTempleDetails();

                      setEditingOfferingId(null);
                      setNewOffering({
                        name: "",
                        description: "",
                        price: "",
                        archana: false,
                        isActive: true,
                        categories: [],
                      });

                      setShowOfferingModal(false);
                    } catch (error) {
                      console.error("Save offering error:", error);
                      alert("Failed to save offering");
                    }
                  }}
                  className="rounded-xl bg-[#C8602A] px-5 py-3 font-semibold text-white"
                >
                  Save Offering
                </button>
              </div>
            </div>
          </div>
        )}
        {isSuperAdmin && showBankModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
              <div className="mb-5 flex items-start justify-between">
                <div>
                  <h3 className="flex items-center gap-2 text-lg font-bold">
                    🏦 Bank & Payout Details
                  </h3>
                  <p className="mt-1 text-sm text-[#8B7355]">
                    Update Razorpay vendor bank details.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowBankModal(false)}
                  className="rounded-full bg-[#f5eee4] px-3 py-1 text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Beneficiary Name (as per bank records)
                  </label>
                  <input
                    value={bankForm.beneficiaryName}
                    onChange={(e) =>
                      setBankForm({
                        ...bankForm,
                        beneficiaryName: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-[#E5D5B5] bg-[#faf3ea] px-4 py-3 outline-none focus:border-[#C8602A]"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <InputField
                    label="Account Number"
                    value={bankForm.accountNumber}
                    onChange={(value) =>
                      setBankForm({ ...bankForm, accountNumber: value })
                    }
                  />

                  <InputField
                    label="Re-enter Account Number"
                    value={bankForm.confirmAccountNumber}
                    onChange={(value) =>
                      setBankForm({ ...bankForm, confirmAccountNumber: value })
                    }
                    disableCopyPaste
                  />

                  <InputField
                    label="IFSC Code"
                    value={bankForm.ifscCode}
                    onChange={(value) =>
                      setBankForm({
                        ...bankForm,
                        ifscCode: value.toUpperCase(),
                      })
                    }
                  />

                  <div>
                    <label className="mb-2 block text-sm font-semibold">
                      Account Type
                    </label>
                    <select
                      value={bankForm.accountType}
                      onChange={(e) =>
                        setBankForm({
                          ...bankForm,
                          accountType: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-[#E5D5B5] bg-[#faf3ea] px-4 py-3 outline-none focus:border-[#C8602A]"
                    >
                      <option>Savings</option>
                      <option>Current</option>
                    </select>
                  </div>

                  <InputField
                    label="PAN Number"
                    value={bankForm.panNumber}
                    onChange={(value) =>
                      setBankForm({
                        ...bankForm,
                        panNumber: value.toUpperCase(),
                      })
                    }
                  />

                  <InputField
                    label="GSTIN (optional)"
                    value={bankForm.gstin}
                    onChange={(value) =>
                      setBankForm({ ...bankForm, gstin: value.toUpperCase() })
                    }
                  />
                </div>

                <div>
                  <p className="mb-3 text-sm font-semibold">Payout Schedule</p>

                  <div className="grid gap-3 md:grid-cols-3">
                    {[
                      ["Instant", "After each transaction"],
                      ["Daily", "Settled next business day"],
                      ["Manual", "Admin initiates payout"],
                    ].map(([title, desc]) => (
                      <button
                        key={title}
                        type="button"
                        onClick={() =>
                          setBankForm({ ...bankForm, payoutSchedule: title })
                        }
                        className={`rounded-xl border p-4 text-left ${
                          bankForm.payoutSchedule === title
                            ? "border-[#C8602A] bg-[#faf3ea]"
                            : "border-[#E5D5B5]"
                        }`}
                      >
                        <p className="font-semibold">{title}</p>
                        <p className="text-xs text-[#8B7355]">{desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowBankModal(false)}
                    className="rounded-xl border border-[#E5D5B5] px-5 py-2.5 font-semibold text-[#8B7355]"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveBankDetails}
                    disabled={isSavingBankDetails}
                    className="rounded-xl bg-[#cf5d25] px-5 py-2.5 font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-400"
                  >
                    {isSavingBankDetails ? "Saving..." : "Save Bank Details"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {isTempleAdmin && showBankRequestModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
              <div className="mb-5 flex items-start justify-between">
                <div>
                  <h3 className="flex items-center gap-2 text-lg font-bold">
                    🏦 Bank & Payout Details
                  </h3>

                  <p className="mt-1 text-sm text-[#8b6f47]">
                    Request a change to the temple bank details.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowBankRequestModal(false)}
                  className="rounded-full bg-[#f5eee4] px-3 py-1 text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <InputField
                  label="Beneficiary Name (as per bank records)"
                  value={bankRequestForm.beneficiaryName}
                  onChange={(value) =>
                    setBankRequestForm({
                      ...bankRequestForm,
                      beneficiaryName: value,
                    })
                  }
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <InputField
                    label="Account Number"
                    value={bankRequestForm.accountNumber}
                    onChange={(value) =>
                      setBankRequestForm({
                        ...bankRequestForm,
                        accountNumber: value,
                      })
                    }
                  />

                  <InputField
                    label="Re-enter Account Number"
                    value={bankRequestForm.confirmAccountNumber}
                    onChange={(value) =>
                      setBankRequestForm({
                        ...bankRequestForm,
                        confirmAccountNumber: value,
                      })
                    }
                    disableCopyPaste
                  />

                  <InputField
                    label="IFSC Code"
                    value={bankRequestForm.ifscCode}
                    onChange={(value) =>
                      setBankRequestForm({
                        ...bankRequestForm,
                        ifscCode: value.toUpperCase(),
                      })
                    }
                  />

                  <div>
                    <label className="mb-2 block text-sm font-semibold">
                      Account Type
                    </label>

                    <select
                      value={bankRequestForm.accountType}
                      onChange={(e) =>
                        setBankRequestForm({
                          ...bankRequestForm,
                          accountType: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-[#dfc9a5] bg-[#faf3ea] px-4 py-3 outline-none focus:border-[#cf5d25]"
                    >
                      <option value="">Select account type</option>
                      <option value="Savings">Savings</option>
                      <option value="Current">Current</option>
                    </select>
                  </div>

                  <InputField
                    label="PAN Number"
                    value={bankRequestForm.panNumber}
                    onChange={(value) =>
                      setBankRequestForm({
                        ...bankRequestForm,
                        panNumber: value.toUpperCase(),
                      })
                    }
                  />

                  <InputField
                    label="GSTIN (optional)"
                    value={bankRequestForm.gstin}
                    onChange={(value) =>
                      setBankRequestForm({
                        ...bankRequestForm,
                        gstin: value.toUpperCase(),
                      })
                    }
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Super Admin Email <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="email"
                    value={bankRequestForm.superAdminEmail}
                    readOnly
                    className="w-full cursor-not-allowed rounded-xl border border-[#dfc9a5] bg-[#f3eee7] px-4 py-3 outline-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowBankRequestModal(false)}
                    className="rounded-xl border border-[#dfc9a5] px-6 py-3 font-semibold text-[#8b6f47] hover:bg-[#f8f1e7]"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleBankChangeRequest}
                    disabled={isSubmittingBankRequest}
                    className="rounded-xl bg-[#cf5d25] px-6 py-3 font-semibold text-white hover:bg-[#b94d1c] disabled:cursor-not-allowed disabled:bg-gray-400"
                  >
                    {isSubmittingBankRequest ? "Sending..." : "Send Request"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </AdminShell>
  );
}

function Stat({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-[#E5D5B5] bg-white p-5">
      <p className="text-xs uppercase text-[#8B7355]">{title}</p>
      <h3 className="mt-2 text-2xl font-bold">{value}</h3>
    </div>
  );
}

function QuickStat({
  label,
  value,
  green,
}: {
  label: string;
  value: string;
  green?: boolean;
}) {
  return (
    <div className="flex justify-between border-b border-[#E5D5B5] py-3 text-sm last:border-0">
      <span className="text-[#8B7355]">{label}</span>
      <span className={green ? "font-bold text-green-600" : "font-bold"}>
        {value}
      </span>
    </div>
  );
}

function BankInfo({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#8B7355]">
        {label}
      </p>
      <p className="font-semibold text-[#2d1606]">{value}</p>
    </div>
  );
}
function PayoutInfo({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-[#8B7355]">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  disableCopyPaste = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disableCopyPaste?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold">{label}</label>

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onPaste={disableCopyPaste ? (e) => e.preventDefault() : undefined}
        onCopy={disableCopyPaste ? (e) => e.preventDefault() : undefined}
        onCut={disableCopyPaste ? (e) => e.preventDefault() : undefined}
        onDrop={disableCopyPaste ? (e) => e.preventDefault() : undefined}
        onDragOver={disableCopyPaste ? (e) => e.preventDefault() : undefined}
        className="w-full rounded-xl border border-[#E5D5B5] bg-[#faf3ea] px-4 py-3 outline-none focus:border-[#C8602A]"
      />
    </div>
  );
}
