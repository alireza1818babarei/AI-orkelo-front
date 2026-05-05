const normalizeId = (value) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : value;
};

const normalizeText = (value) => String(value ?? '').trim();

const normalizeNullableText = (value) => {
  const text = normalizeText(value);
  return text || null;
};

const normalizeAmountNumber = (value) => {
  const numberValue = Number(value ?? 0);
  // ApexCharts needs finite numeric values for mixed column and line series.
  return Number.isFinite(numberValue) ? numberValue : 0;
};

const getOperationSortTime = (operation) => {
  const timestamp = new Date(operation?.operatedAt ?? '').getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
};

const normalizeUser = (user) => {
  if (!user || typeof user !== 'object') return null;

  return {
    id: normalizeId(user?.id),
    name: normalizeText(user?.name),
    email: normalizeText(user?.email),
    avatar: user?.avatar ?? null,
  };
};

export const normalizeFinancialOperationFile = (file) => ({
  id: normalizeId(file?.id),
  operationId: normalizeId(file?.financial_operation_id),
  uploadedBy: normalizeId(file?.uploaded_by ?? null),
  originalName: normalizeText(file?.original_name) || 'Attachment',
  mime: normalizeNullableText(file?.mime),
  size: Number(file?.size ?? 0) || 0,
  downloadUrl: normalizeText(file?.download_url),
  uploader: normalizeUser(file?.uploader),
  createdAt: file?.created_at ?? null,
  updatedAt: file?.updated_at ?? null,
});

export const normalizeFinancialOperation = (operation) => ({
  id: normalizeId(operation?.id),
  companyId: normalizeId(operation?.company_id ?? null),
  title: normalizeText(operation?.title),
  type: normalizeText(operation?.type).toLowerCase(),
  amount: normalizeText(operation?.amount),
  operatedAt: operation?.operated_at ?? null,
  account: normalizeText(operation?.account),
  counterpartyId:
    operation?.counterparty_id == null
      ? null
      : normalizeId(operation?.counterparty_id),
  depositSource: normalizeNullableText(operation?.deposit_source),
  description: normalizeNullableText(operation?.description),
  status: normalizeText(operation?.status).toLowerCase(),
  createdBy:
    operation?.created_by == null ? null : normalizeId(operation?.created_by),
  reviewedBy:
    operation?.reviewed_by == null ? null : normalizeId(operation?.reviewed_by),
  reviewedAt: operation?.reviewed_at ?? null,
  counterparty:
    operation?.counterparty && typeof operation.counterparty === 'object'
      ? {
          id: normalizeId(operation.counterparty?.id),
          fullName: normalizeText(operation.counterparty?.full_name),
          cardNumber: normalizeNullableText(operation.counterparty?.card_number),
          iban: normalizeNullableText(operation.counterparty?.iban),
          account: normalizeNullableText(operation.counterparty?.account),
          bankName: normalizeNullableText(operation.counterparty?.bank_name),
        }
      : null,
  creator: normalizeUser(operation?.creator),
  reviewer: normalizeUser(operation?.reviewer),
  files: Array.isArray(operation?.files)
    ? operation.files.map(normalizeFinancialOperationFile)
    : [],
  createdAt: operation?.created_at ?? null,
  updatedAt: operation?.updated_at ?? null,
});

export const sortFinancialOperationsByOperatedAt = (operations = []) =>
  [...operations].sort((firstOperation, secondOperation) => {
    const timeDifference =
      getOperationSortTime(secondOperation) - getOperationSortTime(firstOperation);

    if (timeDifference !== 0) {
      return timeDifference;
    }

    return Number(secondOperation?.id ?? 0) - Number(firstOperation?.id ?? 0);
  });

export const normalizeFinancialOperationsResponse = (payload) => {
  const root = payload && typeof payload === 'object' ? payload : {};
  const data = Array.isArray(root?.data)
    ? root.data
    : Array.isArray(root)
      ? root
      : [];

  return {
    operations: sortFinancialOperationsByOperatedAt(
      data.map(normalizeFinancialOperation),
    ),
    links: root?.links ?? null,
    meta: root?.meta ?? null,
    total: Number(root?.total ?? root?.meta?.total ?? data.length ?? 0) || 0,
  };
};

export const normalizeFinancialOperationSummary = (payload) => {
  const root = payload && typeof payload === 'object' ? payload : {};
  const data = root?.data && typeof root.data === 'object' ? root.data : {};
  const totals = data?.totals && typeof data.totals === 'object' ? data.totals : {};
  const monthly = Array.isArray(data?.monthly) ? data.monthly : [];

  return {
    period: normalizeText(data?.period) || '12_months',
    totals: {
      income: normalizeText(totals?.income ?? '0.00'),
      outcome: normalizeText(totals?.outcome ?? '0.00'),
      net: normalizeText(totals?.net ?? '0.00'),
      pendingAmount: normalizeText(totals?.pending_amount ?? '0.00'),
      pendingCount: Number(totals?.pending_count ?? 0) || 0,
      incomeValue: normalizeAmountNumber(totals?.income),
      outcomeValue: normalizeAmountNumber(totals?.outcome),
      netValue: normalizeAmountNumber(totals?.net),
      pendingAmountValue: normalizeAmountNumber(totals?.pending_amount),
    },
    monthly: monthly.map((item) => ({
      key: normalizeText(item?.key),
      label: normalizeText(item?.label),
      income: normalizeAmountNumber(item?.income),
      outcome: normalizeAmountNumber(item?.outcome),
      net: normalizeAmountNumber(item?.net),
    })),
  };
};
