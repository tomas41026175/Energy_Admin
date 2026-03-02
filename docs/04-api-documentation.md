# API 文件

本文檔說明後台管理系統所使用的 API 端點與規格。

---

## 🔗 Base URL

```
https://lbbj5pioquwxdexqmcnwaxrpce0lcoqx.lambda-url.ap-southeast-1.on.aws
```

---

## 🔐 認證方式

所有受保護的資源都需要在請求標頭中提供 Bearer Token：

```
Authorization: Bearer <your_access_token>
```

---

## 📋 API 端點

### 使用者登入

使用者登入端點，用於取得 Access Token 與 Refresh Token。

**端點**

```
POST /auth
```

**請求標頭**

```
Content-Type: application/json
```

**請求參數**

| 參數名稱 | 類型 | 必填 | 說明 |
|---------|------|------|------|
| `username` | string | 是 | 使用者名稱 |
| `password` | string | 是 | 使用者密碼 |

**請求範例**

```json
{
  "username": "admin",
  "password": "password123"
}
```

**成功響應 (200)**

```json
{
  "access_token": "string",
  "refresh_token": "string",
  "expires_in": 300,
  "user": {
    "username": "string",
    "role": "string"
  }
}
```

**響應欄位說明**

| 欄位名稱 | 類型 | 說明 |
|---------|------|------|
| `access_token` | string | 短期存取權杖（有效期 300 秒） |
| `refresh_token` | string | 長期刷新權杖 |
| `expires_in` | integer | Access Token 過期時間（秒），固定為 300 |
| `user` | object | 使用者資訊 |
| `user.username` | string | 使用者名稱 |
| `user.role` | string | 使用者角色 |

**錯誤響應**

#### 400 Bad Request

請求參數格式錯誤。

```json
{
  "message": "Invalid request body"
}
```

**可能原因：**
- 缺少必填欄位
- 參數格式不正確

#### 401 Unauthorized

使用者名稱或密碼錯誤。

```json
{
  "message": "Username or password is incorrect"
}
```

#### 415 Unsupported Media Type

Content-Type 標頭不正確。

```json
{
  "code": "UNSUPPORTED_MEDIA_TYPE",
  "message": "Content-Type must be application/json"
}
```

**解決方式：**
- 確保請求標頭包含 `Content-Type: application/json`

#### 500 Internal Server Error

伺服器內部錯誤。

```json
{
  "message": "Failed to generate token"
}
```

或

```json
{
  "message": "Failed to generate refresh token"
}
```

**可能原因：**
- Token 生成失敗
- Refresh Token 生成失敗
- 伺服器內部錯誤

---

### 刷新 Access Token

使用 Refresh Token 取得新的 Access Token，當 Access Token 過期時使用此端點進行刷新。

**端點**

```
POST /auth/refresh
```

**請求標頭**

```
Content-Type: application/json
```

**請求參數**

| 參數名稱 | 類型 | 必填 | 說明 |
|---------|------|------|------|
| `refresh_token` | string | 是 | Refresh Token |

**請求範例**

```json
{
  "refresh_token": "your_refresh_token_here"
}
```

**成功響應 (200)**

```json
{
  "access_token": "string",
  "expires_in": 300
}
```

**響應欄位說明**

| 欄位名稱 | 類型 | 說明 |
|---------|------|------|
| `access_token` | string | 新的 Access Token |
| `expires_in` | integer | Access Token 過期時間（秒），固定為 300 |

**錯誤響應**

#### 400 Bad Request

請求參數格式錯誤或缺少必填欄位。

```json
{
  "message": "Invalid request body"
}
```

或

```json
{
  "message": "refresh_token is required"
}
```

**可能原因：**
- 缺少 `refresh_token` 欄位
- 參數格式不正確

#### 401 Unauthorized

Refresh Token 無效或已過期。

```json
{
  "message": "Invalid refresh token: token is malformed",
  "code": "INVALID_REFRESH_TOKEN"
}
```

**錯誤代碼說明：**

| 錯誤代碼 | 說明 |
|---------|------|
| `INVALID_REFRESH_TOKEN` | Refresh Token 格式錯誤或無效 |
| `REFRESH_TOKEN_EXPIRED` | Refresh Token 已過期 |

**處理方式：**
- 清除所有 Token
- 導向使用者至登入頁面

#### 415 Unsupported Media Type

Content-Type 標頭不正確。

```json
{
  "code": "UNSUPPORTED_MEDIA_TYPE",
  "message": "Content-Type must be application/json"
}
```

**解決方式：**
- 確保請求標頭包含 `Content-Type: application/json`

#### 500 Internal Server Error

伺服器內部錯誤。

```json
{
  "message": "Failed to generate token"
}
```

**可能原因：**
- Token 生成失敗
- 伺服器內部錯誤

---

### 取得使用者列表

取得使用者列表，支援分頁與多種篩選條件。此端點需要 Bearer Token 認證。

**端點**

```
GET /api/users
```

**請求標頭**

```
Authorization: Bearer <your_access_token>
```

**查詢參數**

| 參數名稱 | 類型 | 必填 | 說明 | 預設值 | 限制 |
|---------|------|------|------|--------|------|
| `email` | string | 否 | 依電子郵件篩選（部分匹配，不區分大小寫） | - | - |
| `limit` | integer | 否 | 每頁項目數 | 10 | 1 ≤ limit ≤ 100 |
| `name` | string | 否 | 依名稱篩選（部分匹配，不區分大小寫） | - | - |
| `page` | integer | 否 | 頁碼 | 1 | page ≥ 1 |
| `status` | string | 否 | 依狀態篩選（完全匹配） | - | `active` 或 `inactive` |

**請求範例**

```
GET /api/users?page=1&limit=10&status=active&name=john
Authorization: Bearer your_access_token_here
```

**成功響應 (200)**

```json
{
  "data": [
    {
      "id": 0,
      "name": "string",
      "email": "string",
      "avatar": "string",
      "status": "string",
      "created_at": "string"
    }
  ],
  "pagination": {
    "total": 0,
    "current_page": 0,
    "per_page": 0,
    "total_pages": 0
  }
}
```

**響應欄位說明**

| 欄位名稱 | 類型 | 說明 |
|---------|------|------|
| `data` | array[object] | 使用者列表 |
| `data[].id` | integer | 使用者 ID |
| `data[].name` | string | 使用者名稱 |
| `data[].email` | string | 電子郵件 |
| `data[].avatar` | string | 頭像 URL |
| `data[].status` | string | 使用者狀態 |
| `data[].created_at` | string | 建立時間 |
| `pagination` | object | 分頁資訊 |
| `pagination.total` | integer | 總項目數 |
| `pagination.current_page` | integer | 當前頁碼 |
| `pagination.per_page` | integer | 每頁項目數 |
| `pagination.total_pages` | integer | 總頁數 |

**錯誤響應**

#### 400 Bad Request

查詢參數格式錯誤或超出允許範圍。

```json
{
  "code": "INVALID_PAGE",
  "message": "Invalid page parameter: must be a positive integer"
}
```

或

```json
{
  "code": "INVALID_PAGE",
  "message": "Invalid page parameter: must be greater than or equal to 1"
}
```

或

```json
{
  "code": "INVALID_LIMIT",
  "message": "Invalid limit parameter: must be a positive integer"
}
```

或

```json
{
  "code": "INVALID_LIMIT",
  "message": "Invalid limit parameter: must be greater than or equal to 1"
}
```

或

```json
{
  "code": "INVALID_LIMIT",
  "message": "Invalid limit parameter: maximum value is 100"
}
```

或

```json
{
  "code": "INVALID_PARAMETER",
  "message": "Invalid query parameter: {parameter_name}"
}
```

**錯誤代碼說明：**

| 錯誤代碼 | 說明 |
|---------|------|
| `INVALID_PAGE` | 頁碼參數無效（必須為正整數且 ≥ 1） |
| `INVALID_LIMIT` | 每頁項目數參數無效（必須為正整數，1 ≤ limit ≤ 100） |
| `INVALID_PARAMETER` | 其他查詢參數格式錯誤 |

**處理方式：**
- 檢查查詢參數是否符合規範
- 確保 `page` ≥ 1
- 確保 `limit` 在 1 到 100 之間

#### 401 Unauthorized

缺少或無效的 Authorization 標頭。

```json
{
  "message": "Unauthorized: missing or invalid Authorization header",
  "code": "INVALID_TOKEN"
}
```

或

```json
{
  "message": "Unauthorized: token is malformed",
  "code": "INVALID_TOKEN"
}
```

或

```json
{
  "message": "Unauthorized: token has expired",
  "code": "TOKEN_EXPIRED"
}
```

**錯誤代碼說明：**

| 錯誤代碼 | 說明 |
|---------|------|
| `INVALID_TOKEN` | Token 格式錯誤或無效 |
| `TOKEN_EXPIRED` | Token 已過期 |

**處理方式：**
- 檢查 Authorization 標頭是否正確設定
- Token 過期時，使用 Refresh Token 刷新 Access Token
- 刷新失敗時，清除所有 Token 並導向登入頁面

#### 500 Internal Server Error

伺服器內部錯誤。

```json
{
  "message": "Failed to load users data"
}
```

**可能原因：**
- 資料庫連線失敗
- 伺服器內部錯誤

**處理方式：**
- 記錄錯誤並顯示適當的使用者提示
- 可實作重試機制

---

## 🔄 Token 生命週期

### Access Token

- **有效期**：300 秒（5 分鐘）
- **用途**：用於存取受保護的 API 資源
- **儲存位置**：建議儲存在記憶體中（in-memory），降低安全風險

### Refresh Token

- **有效期**：長期有效（具體時間依伺服器設定）
- **用途**：用於刷新過期的 Access Token
- **儲存位置**：建議儲存在 localStorage，以便頁面重新整理後恢復登入狀態

### Token 刷新流程

1. Access Token 過期時，呼叫 `/auth/refresh` 端點並提供 Refresh Token
2. 伺服器驗證 Refresh Token 後，返回新的 Access Token
3. 刷新成功後，更新 Access Token 並繼續原始請求
4. 刷新失敗時（401 錯誤），清除所有 Token 並導向登入頁面

**刷新請求範例：**

```json
POST /auth/refresh
Content-Type: application/json

{
  "refresh_token": "your_refresh_token_here"
}
```

**注意事項：**
- Refresh Token 本身也可能過期，需處理 `REFRESH_TOKEN_EXPIRED` 錯誤
- 建議實作 refresh lock 機制，避免同時發起多個刷新請求
- 刷新失敗時應清除所有儲存的 Token 並登出使用者

---

## 📝 注意事項

1. **Content-Type 標頭**：所有 POST 請求必須包含 `Content-Type: application/json` 標頭
2. **Token 過期處理**：Access Token 過期時應自動使用 Refresh Token 進行刷新
3. **錯誤處理**：應妥善處理各種錯誤狀態碼，並提供適當的使用者提示
4. **安全性**：Access Token 應儲存在記憶體中，避免 XSS 攻擊風險

---

## 🔗 相關文件

- [技術決策文件](./technical-decisions.md) - Token 儲存與刷新策略
- [實作指南](./implementation-guide.md) - API 客戶端實作細節
- [快速參考指南](./quick-reference.md) - Token 流程說明

---

**返回文件目錄**：[README.md](./README.md)
