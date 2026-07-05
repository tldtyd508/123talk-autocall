const ENDPOINTS = {
  ment: "/pds/manager/api/basic_ment_json.jsp",
  campaignDefaults: "/pds/manager/api/basic_mng_json.jsp",
  campaignSave: "/pds/manager/api/camp_reg_save.jsp",
  targetSave: "/pds/manager/api/camp_reg_dae_save.jsp",
  campaignQuery: "/pds/manager/api/camp_qry_json.jsp",
  targetQuery: "/pds/manager/api/camp_qry_json.jsp",
  monitoring: "/pds/manager/api/mon_camp-2_json.jsp",
};

function apiBaseUrl() {
  return window.localStorage.getItem("acsApiBaseUrl")?.trim() || "";
}

export function getApiBaseUrl() {
  return apiBaseUrl();
}

export function setApiBaseUrl(value) {
  window.localStorage.setItem("acsApiBaseUrl", value.trim());
}

function endpointUrl(path) {
  const base = apiBaseUrl();
  if (!base) return path;
  return `${base.replace(/\/$/, "")}${path}`;
}

function toFormBody(payload) {
  const form = new URLSearchParams();
  Object.entries(payload).forEach(([key, value]) => {
    form.append(key, value == null ? "" : String(value));
  });
  return form;
}

export async function postAcsForm(path, payload) {
  const response = await fetch(endpointUrl(path), {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    },
    body: toFormBody(payload),
  });

  const text = await response.text();
  let data = text;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    // Some test endpoints may return plain text or HTML errors.
  }

  return {
    ok: response.ok,
    status: response.status,
    url: response.url,
    data,
  };
}

export function fetchMentSettings(payload) {
  return postAcsForm(ENDPOINTS.ment, payload);
}

export function fetchCampaignDefaults(payload) {
  return postAcsForm(ENDPOINTS.campaignDefaults, payload);
}

export function saveCampaign(payload) {
  return postAcsForm(ENDPOINTS.campaignSave, payload);
}

export function saveCampaignTargets(payload) {
  return postAcsForm(ENDPOINTS.targetSave, payload);
}

export function queryCampaigns(payload) {
  return postAcsForm(ENDPOINTS.campaignQuery, payload);
}

export function queryTargets(payload) {
  return postAcsForm(ENDPOINTS.targetQuery, payload);
}

export function queryMonitoring(payload) {
  return postAcsForm(ENDPOINTS.monitoring, payload);
}
