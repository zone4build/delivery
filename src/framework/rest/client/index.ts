import type {
  Attachment,
  Author,
  AuthorPaginator,
  AuthorQueryOptions,
  AuthResponse,
  CategoryPaginator,
  CategoryQueryOptions,
  ChangePasswordUserInput,
  CheckoutVerificationInput,
  CouponPaginator,
  CouponQueryOptions,
  CreateAbuseReportInput,
  CreateContactUsInput,
  CreateFeedbackInput,
  CreateOrderInput,
  CreateQuestionInput,
  CreateRefundInput,
  CreateReviewInput,
  DownloadableFilePaginator,
  Feedback,
  ForgotPasswordUserInput,
  LoginUserInput,
  Manufacturer,
  ManufacturerPaginator,
  ManufacturerQueryOptions,
  MyQuestionQueryOptions,
  MyReportsQueryOptions,
  Order,
  OrderPaginator,
  OrderQueryOptions,
  OrderStatusPaginator,
  OtpLoginInputType,
  OTPResponse,
  PasswordChangeResponse,
  PopularProductQueryOptions,
  Product,
  ProductPaginator,
  ProductQueryOptions,
  QueryOptions,
  QuestionPaginator,
  QuestionQueryOptions,
  Refund,
  RefundPaginator,
  RegisterUserInput,
  ResetPasswordUserInput,
  Review,
  ReviewPaginator,
  ReviewQueryOptions,
  ReviewResponse,
  SendOtpCodeInputType,
  Settings,
  Shop,
  ShopPaginator,
  ShopQueryOptions,
  SocialLoginInputType,
  TagPaginator,
  TagQueryOptions,
  Type,
  TypeQueryOptions,
  UpdateReviewInput,
  UpdateUserInput,
  User,
  VerifiedCheckoutData,
  VerifyCouponInputType,
  VerifyCouponResponse,
  VerifyForgotPasswordUserInput,
  VerifyOtpInputType,
  Wishlist,
  WishlistPaginator,
  WishlistQueryOptions,
  GetParams,
  SettingsQueryOptions,
  RedeemPointsCouponRequest,
} from '@/types';
import { API_ENDPOINTS } from './api-endpoints';
import { HttpClient } from './http-client';
import { OTPVerifyResponse } from '@/types';

const isServer = typeof window === 'undefined';
const settingsCache = new Map<string, any>();
const typesCache = new Map<string, any>();
const shopsCache = new Map<string, any>();

class Client {
  products = {
    all: ({
      type,
      categories,
      name,
      shop_id,
      author,
      manufacturer,
      min_price,
      max_price,
      tags,
      text,
      ...params
    }: Partial<ProductQueryOptions>) =>
      HttpClient.get<ProductPaginator>(API_ENDPOINTS.PRODUCTS, {
        searchJoin: 'and',
        with: 'type;author',
        ...params,
        search: HttpClient.formatSearchParams({
          type,
          categories,
          name,
          shop_id,
          author,
          manufacturer,
          min_price,
          max_price,
          tags,
          status: 'publish',
          text,
        }),
      }),
    popular: (params: Partial<PopularProductQueryOptions>) =>
      HttpClient.get<Product[]>(API_ENDPOINTS.PRODUCTS_POPULAR, params),

    questions: ({ question, text, ...params }: QuestionQueryOptions) =>
      HttpClient.get<QuestionPaginator>(API_ENDPOINTS.PRODUCTS_QUESTIONS, {
        searchJoin: 'and',
        ...params,
        search: HttpClient.formatSearchParams({
          question,
          text,
        }),
      }),

    get: ({ slug, language }: GetParams) => {
      const decodedSlug = decodeURIComponent(slug);
      const encodedSlug = encodeURIComponent(decodedSlug);
      return HttpClient.get<Product>(`${API_ENDPOINTS.PRODUCTS}/${encodedSlug}`, {
        language,
        searchJoin: 'and',
        with: 'categories;shop;type;variations;variations.attribute.values;manufacturer;variation_options;tags;author;reviews',
      });
    },

    createFeedback: (input: CreateFeedbackInput) =>
      HttpClient.post<Feedback>(API_ENDPOINTS.FEEDBACK, input),
    createAbuseReport: (input: CreateAbuseReportInput) =>
      HttpClient.post<Review>(
        API_ENDPOINTS.PRODUCTS_REVIEWS_ABUSE_REPORT,
        input
      ),
    createQuestion: (input: CreateQuestionInput) =>
      HttpClient.post<Review>(API_ENDPOINTS.PRODUCTS_QUESTIONS, input),
  };
  myQuestions = {
    all: (params: MyQuestionQueryOptions) =>
      HttpClient.get<QuestionPaginator>(API_ENDPOINTS.MY_QUESTIONS, {
        with: 'user',
        orderBy: 'created_at',
        sortedBy: 'desc',
        ...params,
      }),
  };
  myReports = {
    all: (params: MyReportsQueryOptions) =>
      HttpClient.get<QuestionPaginator>(API_ENDPOINTS.MY_REPORTS, {
        with: 'user',
        orderBy: 'created_at',
        sortedBy: 'desc',
        ...params,
      }),
  };
  reviews = {
    all: ({ rating, ...params }: ReviewQueryOptions) =>
      HttpClient.get<ReviewPaginator>(API_ENDPOINTS.PRODUCTS_REVIEWS, {
        searchJoin: 'and',
        with: 'user',
        ...params,
        search: HttpClient.formatSearchParams({
          rating,
        }),
      }),
    get: ({ id }: { id: string }) =>
      HttpClient.get<Review>(`${API_ENDPOINTS.PRODUCTS_REVIEWS}/${id}`),
    create: (input: CreateReviewInput) =>
      HttpClient.post<ReviewResponse>(API_ENDPOINTS.PRODUCTS_REVIEWS, input),
    update: (input: UpdateReviewInput) =>
      HttpClient.put<ReviewResponse>(
        `${API_ENDPOINTS.PRODUCTS_REVIEWS}/${input.id}`,
        input
      ),
  };
  categories = {
    all: ({ type, category_type, ...params }: Partial<CategoryQueryOptions>) =>
      HttpClient.get<CategoryPaginator>(API_ENDPOINTS.CATEGORIES, {
        searchJoin: 'and',
        ...params,
        ...((type || category_type) && { 
          search: HttpClient.formatSearchParams({ type, category_type }) 
        }),
      }),
  };
  tags = {
    all: (params: Partial<TagQueryOptions>) =>
      HttpClient.get<TagPaginator>(API_ENDPOINTS.TAGS, params),
  };
  types = {
    all: async (params?: Partial<TypeQueryOptions>) => {
      if (isServer) {
        const key = JSON.stringify(params);
        if (typesCache.has(key)) return typesCache.get(key);
        const result = await HttpClient.get<Type[]>(API_ENDPOINTS.TYPES, params);
        typesCache.set(key, result);
        return result;
      }
      return HttpClient.get<Type[]>(API_ENDPOINTS.TYPES, params);
    },
    get: ({ slug, language }: { slug: string; language: string }) =>
      HttpClient.get<Type>(`${API_ENDPOINTS.TYPES}/${slug}`, { language }),
  };
  shops = {
    all: async (params: Partial<ShopQueryOptions>) => {
      if (isServer) {
        const key = JSON.stringify(params);
        if (shopsCache.has(key)) return shopsCache.get(key);
        const result = await HttpClient.get<ShopPaginator>(API_ENDPOINTS.SHOPS, {
          is_active: 1,
          ...params,
        });
        shopsCache.set(key, result);
        return result;
      }
      return HttpClient.get<ShopPaginator>(API_ENDPOINTS.SHOPS, {
        is_active: 1,
        ...params,
      });
    },
    get: (slug: string) =>
      HttpClient.get<Shop>(`${API_ENDPOINTS.SHOPS}/${slug}`),
    discovery: (params: Partial<ShopQueryOptions> & { search?: string }) =>
      HttpClient.get<ShopPaginator>(API_ENDPOINTS.SHOPS_DISCOVERY, {
        ...params,
      }),
  };
  authors = {
    all: ({ name, text, ...params }: Partial<AuthorQueryOptions>) => {
      return HttpClient.get<AuthorPaginator>(API_ENDPOINTS.AUTHORS, {
        ...params,
        search: HttpClient.formatSearchParams({
          name,
          text,
        }),
      });
    },
    top: (params: Pick<QueryOptions, 'limit'>) =>
      HttpClient.get<Author[]>(API_ENDPOINTS.AUTHORS_TOP, params),
    get: ({ slug, language }: { slug: string; language?: string }) =>
      HttpClient.get<Author>(`${API_ENDPOINTS.AUTHORS}/${slug}`, {
        language,
      }),
  };
  manufacturers = {
    all: ({ name, text, ...params }: Partial<ManufacturerQueryOptions>) =>
      HttpClient.get<ManufacturerPaginator>(API_ENDPOINTS.MANUFACTURERS, {
        ...params,
        search: HttpClient.formatSearchParams({
          name,
          text,
        }),
      }),
    top: (params: Pick<QueryOptions, 'limit'>) =>
      HttpClient.get<Manufacturer[]>(API_ENDPOINTS.MANUFACTURERS_TOP, params),
    get: ({ slug, language }: { slug: string; language?: string }) =>
      HttpClient.get<Manufacturer>(`${API_ENDPOINTS.MANUFACTURERS}/${slug}`, {
        language,
      }),
  };
  coupons = {
    all: (params: Partial<CouponQueryOptions>) =>
      HttpClient.get<CouponPaginator>(API_ENDPOINTS.COUPONS, params),
    verify: (input: VerifyCouponInputType) =>
      HttpClient.post<VerifyCouponResponse>(
        API_ENDPOINTS.COUPONS_VERIFY,
        input
      ),
  };
  orders = {
    all: (params: Partial<OrderQueryOptions>) => {
      // Use /orders/assigned endpoint if assigned flag is true
      const endpoint = params?.assigned ? API_ENDPOINTS.ORDERS_ASSIGNED : API_ENDPOINTS.ORDERS;
      // Remove 'assigned' from params as it's not a query parameter
      const { assigned, ...queryParams } = params;
      return HttpClient.get<OrderPaginator>(endpoint, {
        with: 'refund;shipping_address;billing_address',
        ...queryParams,
      });
    },
    get: (tracking_number: string, customer_contact?: string, order_id?: string) => {
      const id = order_id || tracking_number;
      const url = `${API_ENDPOINTS.ORDERS}/${id}?with=children.shop,children.status,children.products,products,status,shipping_address,billing_address,wallet_point`;
      return HttpClient.get<Order>(url, { customer_contact });
    },
    create: (input: CreateOrderInput) =>
      HttpClient.post<Order>(API_ENDPOINTS.ORDERS, input),
    update: (input: any) =>
      HttpClient.put<Order>(`${API_ENDPOINTS.ORDERS}/${input.id}`, input),
    statuses: (params: Pick<QueryOptions, 'limit'>) =>
      HttpClient.get<OrderStatusPaginator>(API_ENDPOINTS.ORDERS_STATUS, params),
    refunds: (params: Pick<QueryOptions, 'limit'>) =>
      HttpClient.get<RefundPaginator>(API_ENDPOINTS.ORDERS_REFUNDS, params),
    createRefund: (input: CreateRefundInput) =>
      HttpClient.post<Refund>(API_ENDPOINTS.ORDERS_REFUNDS, input),

    downloadable: (query?: OrderQueryOptions) =>
      HttpClient.get<DownloadableFilePaginator>(
        API_ENDPOINTS.ORDERS_DOWNLOADS,
        query
      ),
    verify: (input: CheckoutVerificationInput) =>
      HttpClient.post<VerifiedCheckoutData>(
        API_ENDPOINTS.ORDERS_CHECKOUT_VERIFY,
        input
      ),
    generateDownloadLink: (input: { digital_file_id: string }) =>
      HttpClient.post<string>(
        API_ENDPOINTS.GENERATE_DOWNLOADABLE_PRODUCT_LINK,
        input
      ),
    validateCode: (orderId: string | number, code: string) =>
      HttpClient.post<{ valid: boolean; message: string }>(
        API_ENDPOINTS.ORDERS_VALIDATE_CODE(orderId),
        { code }
      ),
  };
  users = {
    me: () => HttpClient.get<User>(API_ENDPOINTS.USERS_ME, { with: 'wallet' }),
    update: (user: UpdateUserInput) =>
      HttpClient.put<User>(`${API_ENDPOINTS.USERS}/${user.id}`, user),
    login: (input: LoginUserInput) =>
      HttpClient.post<AuthResponse>(API_ENDPOINTS.USERS_LOGIN, input),
    socialLogin: (input: SocialLoginInputType) =>
      HttpClient.post<AuthResponse>(API_ENDPOINTS.SOCIAL_LOGIN, input),
    sendOtpCode: (input: SendOtpCodeInputType) =>
      HttpClient.post<OTPResponse>(API_ENDPOINTS.SEND_OTP_CODE, input),
    verifyOtpCode: (input: VerifyOtpInputType) =>
      HttpClient.post<OTPVerifyResponse>(API_ENDPOINTS.VERIFY_OTP_CODE, input),
    OtpLogin: (input: OtpLoginInputType) =>
      HttpClient.post<AuthResponse>(API_ENDPOINTS.OTP_LOGIN, input),
    register: (input: RegisterUserInput) =>
      HttpClient.post<AuthResponse>(API_ENDPOINTS.USERS_REGISTER, input),
    forgotPassword: (input: ForgotPasswordUserInput) => {
      const tenantId = process.env.NEXT_PUBLIC_TENANT_ID!;
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      return HttpClient.post<PasswordChangeResponse>(
        `${origin}/api/auth-proxy/${tenantId}/auth/forgot-password`,
        input
      );
    },
    verifyForgotPasswordToken: (input: VerifyForgotPasswordUserInput) =>
      HttpClient.post<PasswordChangeResponse>(
        API_ENDPOINTS.USERS_VERIFY_FORGOT_PASSWORD_TOKEN,
        input
      ),
    resetPassword: (input: ResetPasswordUserInput) =>
      HttpClient.post<PasswordChangeResponse>(
        API_ENDPOINTS.USERS_RESET_PASSWORD,
        input
      ),
    changePassword: (input: ChangePasswordUserInput) =>
      HttpClient.post<PasswordChangeResponse>(
        API_ENDPOINTS.USERS_CHANGE_PASSWORD,
        input
      ),
    logout: () => HttpClient.post<boolean>(API_ENDPOINTS.USERS_LOGOUT, {}),
    deleteAddress: ({ id }: { id: string }) =>
      HttpClient.delete<boolean>(`${API_ENDPOINTS.USERS_ADDRESS}/${id}`),
    subscribe: (input: { email: string }) =>
      HttpClient.post<any>(API_ENDPOINTS.USERS_SUBSCRIBE_TO_NEWSLETTER, input),
    contactUs: (input: CreateContactUsInput) =>
      HttpClient.post<any>(API_ENDPOINTS.USERS_CONTACT_US, input),
    redeemPointsForCoupon: (input: RedeemPointsCouponRequest) =>
      HttpClient.post<unknown>(
        API_ENDPOINTS.USERS_COUPON_FROM_POINTS,
        input
      ),
  };
  wishlist = {
    all: (params: WishlistQueryOptions) =>
      HttpClient.get<WishlistPaginator>(API_ENDPOINTS.USERS_WISHLIST, {
        with: 'shop',
        orderBy: 'created_at',
        sortedBy: 'desc',
        ...params,
      }),
    toggle: (input: { product_id: string; language?: string }) =>
      HttpClient.post<{ in_wishlist: boolean }>(
        API_ENDPOINTS.USERS_WISHLIST_TOGGLE,
        input
      ),
    remove: (id: string) =>
      HttpClient.delete<Wishlist>(`${API_ENDPOINTS.WISHLIST}/${id}`),
    checkIsInWishlist: ({ product_id }: { product_id: string }) =>
      HttpClient.get<boolean>(
        `${API_ENDPOINTS.WISHLIST}/in_wishlist/${product_id}`
      ),
  };
  settings = {
    all: async (params?: SettingsQueryOptions) => {
      if (isServer) {
        const key = JSON.stringify(params);
        if (settingsCache.has(key)) return settingsCache.get(key);
        const result = await HttpClient.get<Settings>(API_ENDPOINTS.SETTINGS, { ...params });
        settingsCache.set(key, result);
        return result;
      }
      return HttpClient.get<Settings>(API_ENDPOINTS.SETTINGS, { ...params });
    },
    upload: (input: File[]) => {
      let formData = new FormData();
      input.forEach((attachment) => {
        formData.append('attachment[]', attachment);
      });
      return HttpClient.post<Attachment[]>(API_ENDPOINTS.UPLOADS, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
  };
  payments = {
    createSession: (orderId: string, gateway: string = 'stripe') =>
      HttpClient.post<{ url: string }>(
        `${API_ENDPOINTS.CREATE_PAYMENT_SESSION}/${orderId}?gateway=${gateway}`,
        {}
      ),
  };
}

const ShopClient = new Client();
export default ShopClient;
