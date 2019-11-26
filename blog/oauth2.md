# Oauth2<WWW>

上来三连问 what,why,how

## what
OAuth 2.0 is the industry-standard protocol for authorization 行业标准的`授权`协议

## why

为啥要这个东西呢，🌰

小明在QQ空间积攒了多年的照片，想挑选一些照片来打印出来。然后小明在找到一家提供在线打印并且包邮的网站(Print Photo -> PP)

那么现在问题来了，小明有两个方案来得到打印的服务。

1) 在自己的QQ空间把想要打印的照片下载下来，然后提供给PP
2) 把自己的QQ账号密码给PP，然后告诉PP我要打印哪些照片。

针对方案一：小明要去下载照片然后在传给PP，太麻烦了
针对方案二：账号密码给PP, 万一一些不该看的的图片被发网上了。o(*////▽////*)q

小明觉得很痛苦。那么有没有不给PP账号密码，不下载照片，自己选哪些要打印直接扔给PP去打印的办法呢？OAuth走了过来扔给小明一块肥皂....


## how

### 四个重要角色

1) Resource Owner：资源拥有者，上面例子中的小明
2) Resource Server：资源服务器，上面例子中的QQ空间, 托管受保护资源的服务器，能够接收和响应使用访问令牌对受保护资源的请求。
3) Client：第三方应用客户端，上面例子中的PP，代指任何可以消费资源服务器的第三方应用；
4) Authorization Server：授权服务器，管理Resource Owner，Client和Resource Server的三角关系的中间层。

OAuth2解决问题的关键在于使用Authorization server提供一个访问凭据给Client，使得Client可以在不知道Resource owner在Resource server上的用户名和密码的情况下消费Resource owner的受保护资源。

### 授权流程


     +--------+                               +---------------+
     |        |--(A)- Authorization Request ->|   Resource    |
     |        |                               |     Owner     |
     |        |<-(B)-- Authorization Grant ---|               |
     |        |                               +---------------+
     |        |
     |        |                               +---------------+
     |        |--(C)-- Authorization Grant -->| Authorization |
     | Client |                               |     Server    |
     |        |<-(D)----- Access Token -------|               |
     |        |                               +---------------+
     |        |
     |        |                               +---------------+
     |        |--(E)----- Access Token ------>|    Resource   |
     |        |                               |     Server    |
     |        |<-(F)--- Protected Resource ---|               |
     +--------+                               +---------------+


- (A）客户端从资源所有者处请求授权。授权请求可以直接向资源所有者发起（如图所示），或者更可取的是通过授权服务器作为中介间接发起。
- （B）客户端收到授权许可，这是一个代表资源所有者的授权的凭据，使用本规范中定义的四种许可类型之一或者使用扩展许可类型表示。授权许可类型取决于客户端请求授权所使用的方法以及授权服务器支持的类型。
- （C）客户端与授权服务器进行身份认证并出示授权许可以请求访问令牌(access_token)。
- （D）授权服务器验证客户端身份并验证授权许可，若有效则颁发访问令牌。
- （E）客户端从资源服务器请求受保护资源并出示访问令牌进行身份验证。
- （F）资源服务器验证访问令牌，若有效则处理该请求。

对应到上面列子的流程就是

- (A) 小明访问PP，PP向QQ空间发起授权请求
- (B) QQ空间接受PP的授权请求，并返回授权许可给PP
- (C) PP使用授权许可向Authorization server发起请求
- (D) Authorization server验证PP的身份和`授权许可`，发送`访问令牌`给PP
- (E) PP用`访问令牌`请求小明存储在QQ空间的照片
- (F) QQ空间根据访问令牌，返回小明的照片信息给PP

这其中有两个概念`授权许可`和`访问令牌`

### 授权许可
授权许可是一个代表资源所有者授权（访问受保护资源）的凭据，客户端用它来获取访问令牌。本规范定义了四种许可类型——授权码(Authorization Code)、隐式许可(Implicit)、资源所有者密码凭据(Resource Owner Password Credentials)和客户端凭据(Client Credentials)——以及用于定义其他类型的可扩展性机制。

#### 1. [授权码(Authorization Code)](https://tools.ietf.org/html/rfc6749#section-4.1)

这是OAuth2最常用的一种授权许可类型。要求Client具有可公开访问的Server服务器来接受Authorization Code，具体的流程如下：

     +----------+
     | Resource |
     |   Owner  |
     |          |
     +----------+
          ^
          |
         (B)
     +----|-----+          Client Identifier      +---------------+
     |         -+----(A)-- & Redirection URI ---->|               |
     |  User-   |                                 | Authorization |
     |  Agent  -+----(B)-- User authenticates --->|     Server    |
     |          |                                 |               |
     |         -+----(C)-- Authorization Code ---<|               |
     +-|----|---+                                 +---------------+
       |    |                                         ^      v
      (A)  (C)                                        |      |
       |    |                                         |      |
       ^    v                                         |      |
     +---------+                                      |      |
     |         |>---(D)-- Authorization Code ---------'      |
     |  Client |          & Redirection URI                  |
     |         |                                             |
     |         |<---(E)----- Access Token -------------------'
     +---------+       (w/ Optional Refresh Token)

- (A) Client使用浏览器（用户代理）访问Authorization server。也就是用浏览器访问一个URL，这个URL是Authorization server提供的，访问的收Client需要提供（客户端标识，请求范围，本地状态和重定向URL）这些参数。
- (B) Authorization server验证Client在（A）中传递的参数信息，如果无误则提供一个页面供Resource owner登陆，登陆成功后选择Client可以访问Resource server的哪些资源以及读写权限。
- (C）在（B）无误后返回一个授权码（Authorization Code）给Client。
- (D) Client拿着（C）中获得的授权码（Authorization Code）和（客户端标识、重定向URL等信息）作为参数，请求Authorization server提供的获取访问令牌的URL。
- (E) Authorization server返回访问令牌和可选的刷新令牌以及令牌有效时间等信息给Client。

1.1 Authorization Request

对应步骤（A），客户端提供以下参数请求Authorization Server：

- response_type：必选。值固定为“code”。
- client_id：必选。第三方应用的标识ID。
- redirect_uri：必选。授权成功后的重定向地址。
- scope：可选。表示授权范围。
- state：推荐(预防CSRF)。Client提供的一个字符串，服务器会原样返回给Client 

```
GET /authorize?response_type=code&client_id=s6BhdRkqt3&state=xyz&redirect_uri=https%3A%2F%2Fclient%2Eexample%2Ecom%2Fcb HTTP/1.1
Host: server.example.com
```

1.2 Authorization Response

对应步骤（C），Authorization Server会返回如下信息:
- code: 授权码
- state：步骤（A）中客户端提供的state参数原样返回

```
HTTP/1.1 302 Found
Location: https://client.example.com/oauth2?code=SplxlOBeZQQYbYS6WxSbIA&state=xyz
```

1.3 Access Token Request

对应步骤（D），客户端提供以下参数请求Authorization Server：
- grant_type：必选。固定值“authorization_code”。
- code : 必选。Authorization Response 中响应的code。
- redirect_uri：必选。必须和Authorization Request中提供的redirect_uri相同。
- client_id：必选。必须和Authorization Request中提供的client_id相同。

```
POST /token HTTP/1.1
Host: server.example.com
Authorization: Basic czZCaGRSa3F0MzpnWDFmQmF0M2JW
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code&code=SplxlOBeZQQYbYS6WxSbIA
&redirect_uri=https%3A%2F%2Fclient%2Eexample%2Ecom%2Fcb
```

1.4 Access Token Response

对应步骤（E），Authorization Server会返回如下典型的信息
- access_token：访问令牌。
- refresh_token：刷新令牌。
- expires_in：过期时间。

```
HTTP/1.1 200 OK
Content-Type: application/json;charset=UTF-8

{
   "access_token":"2YotnFZFEjr1zCsicMWpAA",
   "token_type":"example",
   "expires_in":3600, 
   "refresh_token":"tGzv3JOkF0XG5Qx2TlKWIA", 
   "example_parameter":"example_value"
}
```

#### 2. [隐式(Implicit Grant)](https://tools.ietf.org/html/rfc6749#section-4.2)

这个是Authorization Code的简化版本。其中省略掉了颁发授权码（Authorization Code）给客户端的过程，而是直接返回访问令牌和可选的刷新令牌。

隐式许可提高了一些客户端（例如一个作为浏览器内应用实现的客户端）的响应速度和效率，因为它减少了获取访问令牌所需的往返数量。然而，这种便利应该和采用隐式许可的安全影响作权衡，尤其是当授权码许可类型可用的时候。流程如下:

     +----------+
     | Resource |
     |  Owner   |
     |          |
     +----------+
          ^
          |
         (B)
     +----|-----+          Client Identifier     +---------------+
     |         -+----(A)-- & Redirection URI --->|               |
     |  User-   |                                | Authorization |
     |  Agent  -|----(B)-- User authenticates -->|     Server    |
     |          |                                |               |
     |          |<---(C)--- Redirection URI ----<|               |
     |          |          with Access Token     +---------------+
     |          |            in Fragment
     |          |                                +---------------+
     |          |----(D)--- Redirection URI ---->|   Web-Hosted  |
     |          |          without Fragment      |     Client    |
     |          |                                |    Resource   |
     |     (F)  |<---(E)------- Script ---------<|               |
     |          |                                +---------------+
     +-|--------+
       |    |
      (A)  (G) Access Token
       |    |
       ^    v
     +---------+
     |         |
     |  Client |
     |         |
     +---------+

2.1 Authorization Request

对应步骤(B)，客户端提供以下参数请求Authorization Server：
- response_type：必选。值固定为“token”。
- client_id：必选。第三方应用的标识ID。
- redirect_uri：可选。授权成功后的重定向地址。
- scope：可选。表示授权范围。
- state：推荐。Client提供的一个字符串，服务器会原样返回给Client。

区别在于response_type为“token”，而不再是“code”，redirect_uri也变为了可选参数(可选?)。
```
GET /authorize?response_type=token&client_id=s6BhdRkqt3&state=xyz
        &redirect_uri=https%3A%2F%2Fclient%2Eexample%2Ecom%2Fcb HTTP/1.1
    Host: server.example.com
```

2.2 Access Token Response

对应步骤(C) Authorization Server会返回如下典型的信息：
- access_token：访问令牌。
- refresh_token：刷新令牌。
- expires_in：过期时间。

```
HTTP/1.1 302 Found
Location: http://client.example.com/oauth2#access_token=2YotnFZFEjr1zCsicMWpAA&state=xyz&expires_in=3600
```

注意其和Authorization Code的最大区别在于它是把token信息放在了url的hash部分（#后面），而不是作为参数(?后面)

#### 3. [Resource Owner Password Credentials Grant](https://tools.ietf.org/html/rfc6749#section-4.3)

     +----------+
     | Resource |
     |  Owner   |
     |          |
     +----------+
          v
          |    Resource Owner
         (A) Password Credentials
          |
          v
     +---------+                                  +---------------+
     |         |>--(B)---- Resource Owner ------->|               |
     |         |         Password Credentials     | Authorization |
     | Client  |                                  |     Server    |
     |         |<--(C)---- Access Token ---------<|               |
     |         |    (w/ Optional Refresh Token)   |               |
     +---------+                                  +---------------+

这种模式再一步简化，和Authorzation Code类型下重要的区分就是省略了Authorization Request和Authorization Response。而是Client直接使用Resource owner提供的username和password来直接请求access_token（直接发起Access Token Request然后返回Access Token Response信息）。这种模式一般适用于Resource server高度信任第三方Client的情况下

3.1 Authorization Request

对应步骤(B)，客户端提供以下参数请求Authorization Server：
- `grant_type`：必选。值固定为“password”。
- username：必选。用户登陆名。
- passward：必选。用户登陆密码。
- scope：可选。表示授权范围。

```
POST /token HTTP/1.1
Host: server.example.com
Content-Type: application/x-www-form-urlencoded
grant_type=password&username=blackheart&password=1234
```

2.2 Access Token Response

对应步骤(C) Authorization Server会返回如下典型的信息：
- access_token：访问令牌。
- refresh_token：刷新令牌。
- expires_in：过期时间。

```
HTTP/1.1 200 OK
Content-Type: application/json;charset=UTF-8
Cache-Control: no-store
Pragma: no-cache

{
  "access_token":"2YotnFZFEjr1zCsicMWpAA",
  "token_type":"example",
  "expires_in":3600,
  "refresh_token":"tGzv3JOkF0XG5Qx2TlKWIA",
  "example_parameter":"example_value"
}
```

#### 4. [Client Credentials Grant](https://tools.ietf.org/html/rfc6749#section-4.4)

这种类型就更简化了，Client直接已自己的名义而不是Resource owner的名义去要求访问Resource server的一些受保护资源。

    +---------+                                  +---------------+
     |         |                                  |               |
     |         |>--(A)- Client Authentication --->| Authorization |
     | Client  |                                  |     Server    |
     |         |<--(B)---- Access Token ---------<|               |
     |         |                                  |               |
     +---------+                                  +---------------+

4.1 Access Token Request

- `grant_type`：必选。值固定为“client_credentials”。
- scope：可选。表示授权范围。

具体的 request 和 response 就不列出来了。

### 访问令牌
访问令牌是用于访问受保护资源的凭据。访问令牌是一个代表向客户端颁发的授权的字符串。该字符串通常对于客户端是不透明的。令牌代表了访问权限的由资源所有者许可并由资源服务器和授权服务器实施的具体范围和期限。

令牌可以表示一个用于检索授权信息的标识符或者可以以可验证的方式自包含授权信息（即令牌字符串由数据和签名组成）。额外的身份验证凭据——在本规范范围以外——可以被要求以便客户端使用令牌。

访问令牌提供了一个抽象层，用单一的资源服务器能理解的令牌代替不同的授权结构（例如，用户名和密码，客户端标识，访问资源的访问以及权限等等）。这种抽象使得颁发访问令牌比颁发用于获取令牌的授权许可更受限制，同时消除了资源服务器理解各种各样身份认证方法的需要。

基于资源服务器的安全要求访问令牌可以有不同的格式、结构及采用的方法（如，加密属性）。访问令牌的属性和用于访问受保护资源的方法超出了本规范的范围，它们在[RFC6750](http://tools.ietf.org/html/rfc6750)等配套规范中定义, 感兴趣的同学自行查阅。

### OAuth2刷新令牌

刷新令牌是用于获取访问令牌的凭据。刷新令牌由授权服务器颁发给客户端，用于在当前访问令牌失效或过期时，获取一个新的访问令牌，或者获得相等或更窄范围的额外的访问令牌（访问令牌可能具有比资源所有者所授权的更短的生命周期和更少的权限）。颁发刷新令牌是可选的，由授权服务器决定。如果授权服务器颁发刷新令牌，在颁发访问令牌时它被包含在内（即图1中的步骤D）。

刷新令牌是一个代表由资源所有者给客户端许可的授权的字符串。该字符串通常对于客户端是不透明的。该令牌表示一个用于检索授权信息的标识符。不同于访问令牌，刷新令牌设计只与授权服务器使用，并不会发送到资源服务器。

    +--------+                                           +---------------+
    |        |--(A)------- Authorization Grant --------->|               |
    |        |                                           |               |
    |        |<-(B)----------- Access Token -------------|               |
    |        |               & Refresh Token             |               |
    |        |                                           |               |
    |        |                            +----------+   |               |
    |        |--(C)---- Access Token ---->|          |   |               |
    |        |                            |          |   |               |
    |        |<-(D)- Protected Resource --| Resource |   | Authorization |
    | Client |                            |  Server  |   |     Server    |
    |        |--(E)---- Access Token ---->|          |   |               |
    |        |                            |          |   |               |
    |        |<-(F)- Invalid Token Error -|          |   |               |
    |        |                            +----------+   |               |
    |        |                                           |               |
    |        |--(G)----------- Refresh Token ----------->|               |
    |        |                                           |               |
    |        |<-(H)----------- Access Token -------------|               |
    +--------+           & Optional Refresh Token        +---------------+

- （A）客户端通过与授权服务器进行身份验证并出示授权许可请求访问令牌。
- （B）授权服务器对客户端进行身份验证并验证授权许可，若有效则颁发访问令牌和刷新令牌。
- （C）客户端通过出示访问令牌向资源服务器发起受保护资源的请求。
- （D）资源服务器验证访问令牌，若有效则满足该要求。
- （E）步骤（C）和（D）重复进行，直到访问令牌到期。如果客户端知道访问令牌已过期，跳到步骤（G），否 则它将继续发起另一个对受保护资源的请求。
- （F）由于访问令牌是无效的，资源服务器返回无效令牌错误。
- （G）客户端通过与授权服务器进行身份验证并出示刷新令牌，请求一个新的访问令牌。客户端身份验证要求基于客户端的类型和授权服务器的策略。
- （H）授权服务器对客户端进行身份验证并验证刷新令牌，若有效则颁发一个新的访问令牌（和——可选地——一个新的刷新令牌）。

Refreshing Access Token Request

- `grant_type`：必选。值固定为“refresh_token”。
- refresh_token：必选。客户端得到access_token的同时拿到的刷新令牌。
- scope：可选。表示授权范围。

```
POST /token HTTP/1.1
Host: server.example.com

grant_type=refresh_token&refresh_token=tGzv3JOkF0XG5Qx2TlKWIA
```

Refreshing Access Token Response

```
HTTP/1.1 200 OK
Content-Type: application/json;charset=UTF-8
Cache-Control: no-store
Pragma: no-cache

{
  "access_token":"2YotnFZFEjr1zCsicMWpAA",
  "token_type":"example",
  "expires_in":3600,
  "refresh_token":"tGzv3JOkF0XG5Qx2TlKWIA",
  "example_parameter":"example_value"
}
```

### [Token使用方式](https://tools.ietf.org/html/rfc6750#section-2)

1. Authorization Request Header Field

HTTP应用层协议中，专门有定义一个授权使用的Request Header，使用这种方式：
```
GET /resource HTTP/1.1
Host: server.example.com
Authorization: Bearer mF_9.B5f-4.1JqM
```
其中"Bearer "是固定的在access_token前面的头部信息。

2. Form-Encoded Body Parameter

使用Request Body这种方式，有一个额外的要求，就是Request Header的"Content-Type"必须是固定的“application/x-www-form-urlencoded”，此外还有一个限制就是不可以使用GET访问.
```
POST /resource HTTP/1.1
Host: server.example.com
Content-Type: application/x-www-form-urlencoded

access_token=mF_9.B5f-4.1JqM
```

3. URI Query Parameter

在我们请求受保护的资源的Url后面追加一个access_token的参数即可。另外还有一点要求，就是Client需要设置以下Request Header的Cache-Control:no-store，用来阻止access_token不会被Web中间件给log下来，属于安全防护方面的一个考虑。
```
GET /resource?access_token=mF_9.B5f-4.1JqM HTTP/1.1
Host: server.example.com
```

### OAuth2的安全问题

[参考1](https://github.com/jeansfish/RFC6749.zh-cn/blob/master/Section10/10.md)

[参考2](https://tools.ietf.org/html/rfc6819)

### [OAuth2 Token 撤销](https://tools.ietf.org/html/rfc7009)

简单来说，这个协议规定了一个Authorization server提供一个怎样的API来供Client撤销access_token或者refresh_token。

比如Client发起一个如下的请求：
```
POST /revoke HTTP/1.1
Host: server.example.com
Content-Type: application/x-www-form-urlencoded
Authorization: Basic czZCaGRSa3F0MzpnWDFmQmF0M2JW

token=45ghiukldjahdnhzdauz&token_type_hint=refresh_token
```

- Content-Type: application/x-www-form-urlencoded：固定此格式。
- Authorization: Basic czZCaGRSa3F0MzpnWDFmQmF0M2JW：访问受保护资源的授权凭证。
- token：必选，可以是access_token或者refresh_token的内容。
- token_type_hint：可选，表示token的类型，值为”access_token“或者"refresh_token"。

如果撤销成功，则返回一个HTTP status code为200的响应就可以了。

### OAuth2 Token 元数据

咦，为啥需要这个呢。

OAuth2提供的“access_token"是一个对Client不透明的字符串，尽管有"scope"，"expires_in"和"refresh_token"来辅助，但也是不完善的且分散的信息。假如需要“小明授权在线打印并且包邮的网站访问自己的QQ空间的相册”这个信息。client是无法知道的。

这个规范是为OAuth2扩展了一个API接口（Introspection Endpoint），让第三方Client可以查询上面提到的那些信息（比如，access_token是否还有效，谁颁发的，颁发给谁的，scope又哪些等等的元数据信息）

比如Client发起一个如下的请求：
```
POST /introspect HTTP/1.1
Host: server.example.com
Accept: application/json
Content-Type: application/x-www-form-urlencoded
Authorization: Basic czZCaGRSa3F0MzpnWDFmQmF0M2JW

token=mF_9.B5f-4.1JqM&token_type_hint=access_token
```
如果请求成功，则会返回如下的信息：
```
HTTP/1.1 200 OK
Content-Type: application/json

{
  "active": true,
  "client_id": "l238j323ds-23ij4",
  "username": "jdoe",
  "scope": "read write dolphin",
  "sub": "Z5O3upPC88QrAjx00dis",
  "aud": "https://protected.example.net/resource",
  "iss": "https://server.example.com/",
  "exp": 1419356238,
  "iat": 1419350238,
  "extension_field": "twenty-seven"
}
```
json 中各项属性含义如下:

- active：必须的。表示token是否还是有效的。
- client_id：可选的。表示token所属的Client。
- token_type：可选的。表示token的类型。对应传递的token_type_hint。
- user_name：可选的。表示token的授权者的名字。
- scope：可选的。表示授权给Client访问的范围。
- sub：可选的。token所属的资源拥有者的唯一标识，JWT定义的。
- aud：可选的。token颁发给谁的，JWT定义的。
- iss：可选的。token的颁发者，JWT定义的。
- exp：可选的。token的过期时间，JWT定义的。
- iat：可选的。iss颁发token的时间，JWT定义的。
- nbf：可选的。token不会在这个时间之前被使用，JWT定义的。
- jti：可选的。token的唯一标识，JWT定义的。
- extension_field：可以自己扩展相关其他属性。

主要到上面好多可选的属性。好多是在 [jwt](https://jwt.io/) (JSON Web Token)中定义的