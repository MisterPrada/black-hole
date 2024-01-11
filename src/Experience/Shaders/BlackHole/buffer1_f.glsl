#define SAMPLES 200

uniform float uTime;
uniform vec4 uMouse;
uniform vec3 uCameraPosition;
uniform float uCameraZoom;
uniform vec2 uResolution;
uniform sampler2D uBuffer1;
uniform sampler2D uBuffer2;
uniform sampler2D uBuffer3;
uniform sampler2D uBuffer4;

varying vec2 vUv;


const vec3 MainColor = vec3(1.0);

//noise code by iq
float noise( in vec3 x )
{
    vec3 p = floor(x);
    vec3 f = fract(x);
    f = f*f*(3.0-2.0*f);
    vec2 uv = (p.xy+vec2(37.0,17.0)*p.z) + f.xy;
    vec2 rg = textureLod( uBuffer1, (uv+ 0.5)/256.0, 0.0 ).yx;
    return -1.0+2.0*mix( rg.x, rg.y, f.z );
}

float saturate(float x)
{
    return clamp(x, 0.0, 1.0);
}

vec3 saturate(vec3 x)
{
    return clamp(x, vec3(0.0), vec3(1.0));
}

float rand(vec2 coord)
{
    return saturate(fract(sin(dot(coord, vec2(12.9898, 78.223))) * 43758.5453));
}

float pcurve( float x, float a, float b )
{
    float k = pow(a+b,a+b) / (pow(a,a)*pow(b,b));
    return k * pow( x, a ) * pow( 1.0-x, b );
}

const float pi = 3.14159265;

float atan2(float y, float x)
{
    if (x > 0.0)
    {
        return atan(y / x);
    }
    else if (x == 0.0)
    {
        if (y > 0.0)
        {
            return pi / 2.0;
        }
        else if (y < 0.0)
        {
            return -(pi / 2.0);
        }
        else
        {
            return 0.0;
        }
    }
    else //(x < 0.0)
    {
        if (y >= 0.0)
        {
            return atan(y / x) + pi;
        }
        else
        {
            return atan(y / x) - pi;
        }
    }
}

float sdTorus(vec3 p, vec2 t)
{
    vec2 q = vec2(length(p.xz) - t.x, p.y);
    return length(q)-t.y;
}

float sdSphere(vec3 p, float r)
{
    return length(p)-r;
}

void Haze(inout vec3 color, vec3 pos, float alpha)
{
    vec2 t = vec2(1.0, 0.01);

    float torusDist = length(sdTorus(pos + vec3(0.0, -0.05, 0.0), t));

    float bloomDisc = 1.0 / (pow(torusDist, 2.0) + 0.001);
    vec3 col = MainColor;
    bloomDisc *= length(pos) < 0.5 ? 0.0 : 1.0;

    color += col * bloomDisc * (2.9 / float(SAMPLES)) * (1.0 - alpha * 1.0);
}

void GasDisc(inout vec3 color, inout float alpha, vec3 pos)
{
    float discRadius = 3.2;
    float discWidth = 5.3;
    float discInner = discRadius - discWidth * 0.5;
    float discOuter = discRadius + discWidth * 0.5;

    vec3 origin = vec3(0.0, 0.0, 0.0);
    float mouseZ = uMouse.y / uResolution.y;
    vec3 discNormal = normalize(vec3(0.0, 1.0, 0.0));
    float discThickness = 0.1;

    float distFromCenter = distance(pos, origin);
    float distFromDisc = dot(discNormal, pos - origin);

    float radialGradient = 1.0 - saturate((distFromCenter - discInner) / discWidth * 0.5);

    float coverage = pcurve(radialGradient, 4.0, 0.9);

    discThickness *= radialGradient;
    coverage *= saturate(1.0 - abs(distFromDisc) / discThickness);

    vec3 dustColorLit = MainColor;
    vec3 dustColorDark = vec3(0.0, 0.0, 0.0);

    float dustGlow = 1.0 / (pow(1.0 - radialGradient, 2.0) * 290.0 + 0.002);
    vec3 dustColor = dustColorLit * dustGlow * 8.2;

    coverage = saturate(coverage * 0.7);


    float fade = pow((abs(distFromCenter - discInner) + 0.4), 4.0) * 0.04;
    float bloomFactor = 1.0 / (pow(distFromDisc, 2.0) * 40.0 + fade + 0.00002);
    vec3 b = dustColorLit * pow(bloomFactor, 1.5);

    b *= mix(vec3(1.7, 1.1, 1.0), vec3(0.5, 0.6, 1.0), vec3(pow(radialGradient, 2.0)));
    b *= mix(vec3(1.7, 0.5, 0.1), vec3(1.0), vec3(pow(radialGradient, 0.5)));

    dustColor = mix(dustColor, b * 150.0, saturate(1.0 - coverage * 1.0));
    coverage = saturate(coverage + bloomFactor * bloomFactor * 0.1);

    if (coverage < 0.01)
    {
        return;
    }


    vec3 radialCoords;
    radialCoords.x = distFromCenter * 1.5 + 0.55;
    radialCoords.y = atan2(-pos.x, -pos.z) * 1.5;
    radialCoords.z = distFromDisc * 1.5;

    radialCoords *= 0.95;

    float speed = 0.06;

    float noise1 = 1.0;
    vec3 rc = radialCoords + 0.0;               rc.y += uTime * speed;
    noise1 *= noise(rc * 3.0) * 0.5 + 0.5;      rc.y -= uTime * speed;
    noise1 *= noise(rc * 6.0) * 0.5 + 0.5;      rc.y += uTime * speed;
    noise1 *= noise(rc * 12.0) * 0.5 + 0.5;     rc.y -= uTime * speed;
    noise1 *= noise(rc * 24.0) * 0.5 + 0.5;     rc.y += uTime * speed;

    float noise2 = 2.0;
    rc = radialCoords + 30.0;
    noise2 *= noise(rc * 3.0) * 0.5 + 0.5;      rc.y += uTime * speed;
    noise2 *= noise(rc * 6.0) * 0.5 + 0.5;      rc.y -= uTime * speed;
    noise2 *= noise(rc * 12.0) * 0.5 + 0.5;     rc.y += uTime * speed;
    noise2 *= noise(rc * 24.0) * 0.5 + 0.5;     rc.y -= uTime * speed;
    noise2 *= noise(rc * 48.0) * 0.5 + 0.5;     rc.y += uTime * speed;
    noise2 *= noise(rc * 92.0) * 0.5 + 0.5;     rc.y -= uTime * speed;

    dustColor *= noise1 * 0.998 + 0.002;
    coverage *= noise2;

    radialCoords.y += uTime * speed * 0.5;

    dustColor *= pow(texture(uBuffer2, radialCoords.yx * vec2(0.15, 0.27)).rgb, vec3(2.0)) * 4.0;

    coverage = saturate(coverage * 1200.0 / float(SAMPLES));
    dustColor = max(vec3(0.0), dustColor);

    coverage *= pcurve(radialGradient, 4.0, 0.9);

    color = (1.0 - alpha) * dustColor * coverage + color;

    alpha = (1.0 - alpha) * coverage + alpha;
}



vec3 rotate(vec3 p, float x, float y, float z)
{
    mat3 matx = mat3(1.0, 0.0, 0.0,
    0.0, cos(x), sin(x),
    0.0, -sin(x), cos(x));

    mat3 maty = mat3(cos(y), 0.0, -sin(y),
    0.0, 1.0, 0.0,
    sin(y), 0.0, cos(y));

    mat3 matz = mat3(cos(z), sin(z), 0.0,
    -sin(z), cos(z), 0.0,
    0.0, 0.0, 1.0);

    p = matx * p;
    p = matz * p;
    p = maty * p;

    return p;
}

void RotateCamera(inout vec3 eyevec, inout vec3 eyepos)
{
    float mousePosY = uMouse.y / uResolution.y;
    float mousePosX = uMouse.x / uResolution.x;

    vec3 angle = vec3(mousePosY * 0.05 + 0.05, 1.0 + mousePosX * 1.0, -0.45);

    eyevec = rotate(eyevec, angle.x, angle.y, angle.z);
    eyepos = rotate(eyepos, angle.x, angle.y, angle.z);
}

void WarpSpace(inout vec3 eyevec, inout vec3 raypos)
{
    vec3 origin = vec3(0.0, 0.0, 0.0);

    float singularityDist = distance(raypos, origin);
    float warpFactor = 1.0 / (pow(singularityDist, 2.0) + 0.000001);

    vec3 singularityVector = normalize(origin - raypos);

    float warpAmount = 5.0;

    eyevec = normalize(eyevec + singularityVector * warpFactor * warpAmount / float(SAMPLES));
}

vec3 objectPos = vec3(0.0, 0.0, 0.0); // Позиция объекта

void main()
{

//    uMouse.x = 0.0;
//    uMouse.y = 0.0;
//    uMouse.z = 2.0;
    vec2 uv = vUv;

    float aspect = uResolution.x / uResolution.y;

    vec2 uveye = uv;

    uveye.x += (rand(uv + sin(uTime * 1.0)) / uResolution.x) * (uMouse.z > 1.0 ? 0.0 : 1.0);
    uveye.y += (rand(uv + 1.0 + sin(uTime * 1.0)) / uResolution.y) * (uMouse.z > 1.0 ? 0.0 : 1.0);

    vec3 eyevec = normalize(vec3((uveye * 2.0 - 1.0) * vec2(aspect, 1.0), 6.0));
    vec3 eyepos = vec3(0.0, -0.0, -uCameraZoom);

    vec2 mousepos = uMouse.xy / uResolution.xy;
    if (mousepos.x == 0.0)
    {
        mousepos.x = 0.45;
    }
    eyepos.x += mousepos.x * 3.0 - 1.5;

//    eyepos.y += sin(uTime);
//    eyevec.y += -sin(uTime) / 10.0;

    const float far = 20.0;


    //  eyevec



//    eyepos.y += uCameraPosition.y;
//    eyevec.y -= uCameraPosition.y / 10.0;
//
//    eyepos.x += uCameraPosition.x;
//    eyevec.x -= uCameraPosition.x / 10.0;

    //eyepos.x -= 1.0;


    RotateCamera(eyevec, eyepos);


    vec3 color = vec3(0.0, 0.0, 0.0);

    float dither = rand(uv
    + sin(uTime * 1.0) * 1.0  * (uMouse.z > 1.0 ? 0.0 : 1.0)
    ) * 2.0;

    dither += clamp(160.0 - uTime * 3., 0.0, 1000.0);


    float alpha = 0.0;
    vec3 raypos = eyepos + eyevec * dither * far / float(SAMPLES);
    for (int i = 0; i < SAMPLES; i++)
    {
        WarpSpace(eyevec, raypos);
        raypos += eyevec * far / float(SAMPLES);
        GasDisc(color, alpha, raypos);
        Haze(color, raypos, alpha);
    }

    color *= 0.0001;

    const float p = 1.0;
    vec3 previous = pow(texture(uBuffer3, uv).rgb, vec3(1.0 / p));

    color = pow(color, vec3(1.0 / p));

    float blendWeight = 0.9 * (uMouse.z > 1.0 ? 0.0 : 1.0);

    color = mix(color, previous, blendWeight);

    color = pow(color, vec3(p));

    gl_FragColor = vec4(saturate(color), 1.0);
}
