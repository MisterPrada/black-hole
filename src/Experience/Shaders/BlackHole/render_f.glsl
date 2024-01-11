#define iterations 14
#define formuparam 0.53

#define volsteps 20
#define stepsize 0.2

#define zoom   0.800
#define tile   0.850
#define speed  0.0002

#define brightness 0.0015
#define darkmatter 0.600
#define distfading 0.730
#define saturation 0.350

uniform float uTime;
uniform vec2 uResolution;
uniform sampler2D uBuffer1;
uniform sampler2D uBuffer2;
uniform sampler2D uBuffer3;
uniform sampler2D uBuffer4;

varying vec2 vUv;

vec3 saturate(vec3 x)
{
    return clamp(x, vec3(0.0), vec3(1.0));
}

vec4 cubic(float x)
{
    float x2 = x * x;
    float x3 = x2 * x;
    vec4 w;
    w.x =   -x3 + 3.0*x2 - 3.0*x + 1.0;
    w.y =  3.0*x3 - 6.0*x2       + 4.0;
    w.z = -3.0*x3 + 3.0*x2 + 3.0*x + 1.0;
    w.w =  x3;
    return w / 6.0;
}

vec4 BicubicTexture(in sampler2D tex, in vec2 coord)
{
    vec2 resolution = uResolution.xy;

    coord *= resolution;

    float fx = fract(coord.x);
    float fy = fract(coord.y);
    coord.x -= fx;
    coord.y -= fy;

    fx -= 0.5;
    fy -= 0.5;

    vec4 xcubic = cubic(fx);
    vec4 ycubic = cubic(fy);

    vec4 c = vec4(coord.x - 0.5, coord.x + 1.5, coord.y - 0.5, coord.y + 1.5);
    vec4 s = vec4(xcubic.x + xcubic.y, xcubic.z + xcubic.w, ycubic.x + ycubic.y, ycubic.z + ycubic.w);
    vec4 offset = c + vec4(xcubic.y, xcubic.w, ycubic.y, ycubic.w) / s;

    vec4 sample0 = texture(tex, vec2(offset.x, offset.z) / resolution);
    vec4 sample1 = texture(tex, vec2(offset.y, offset.z) / resolution);
    vec4 sample2 = texture(tex, vec2(offset.x, offset.w) / resolution);
    vec4 sample3 = texture(tex, vec2(offset.y, offset.w) / resolution);

    float sx = s.x / (s.x + s.y);
    float sy = s.z / (s.z + s.w);

    return mix( mix(sample3, sample2, sx), mix(sample1, sample0, sx), sy);
}

vec3 ColorFetch(vec2 coord)
{
    return texture(uBuffer1, coord).rgb;
}

vec3 BloomFetch(vec2 coord)
{
    return BicubicTexture(uBuffer4, coord).rgb;
}

vec3 Grab(vec2 coord, const float octave, const vec2 offset)
{
    float scale = exp2(octave);

    coord /= scale;
    coord -= offset;

    return BloomFetch(coord);
}

vec2 CalcOffset(float octave)
{
    vec2 offset = vec2(0.0);

    vec2 padding = vec2(10.0) / uResolution.xy;

    offset.x = -min(1.0, floor(octave / 3.0)) * (0.25 + padding.x);

    offset.y = -(1.0 - (1.0 / exp2(octave))) - padding.y * octave;

    offset.y += min(1.0, floor(octave / 3.0)) * 0.35;

    return offset;
}

vec3 GetBloom(vec2 coord)
{
    vec3 bloom = vec3(0.0);

    //Reconstruct bloom from multiple blurred images
    bloom += Grab(coord, 1.0, vec2(CalcOffset(0.0))) * 1.0;
    bloom += Grab(coord, 2.0, vec2(CalcOffset(1.0))) * 1.5;
    bloom += Grab(coord, 3.0, vec2(CalcOffset(2.0))) * 1.0;
    bloom += Grab(coord, 4.0, vec2(CalcOffset(3.0))) * 1.5;
    bloom += Grab(coord, 5.0, vec2(CalcOffset(4.0))) * 1.8;
    bloom += Grab(coord, 6.0, vec2(CalcOffset(5.0))) * 1.0;
    bloom += Grab(coord, 7.0, vec2(CalcOffset(6.0))) * 1.0;
    bloom += Grab(coord, 8.0, vec2(CalcOffset(7.0))) * 1.0;

    return bloom;
}

vec2 scaleUV(vec2 uv, vec2 scale) {
    vec2 center = vec2(0.5, 0.5);
    uv -= center;
    uv *= scale;
    uv += center;
    return uv;
}

void main()
{
    vec2 uv = vUv;

    //uv = scaleUV(uv, vec2(0.4, 0.4));

    vec2 fragCoord = vUv * uResolution.xy;


    vec3 color = ColorFetch(uv);


    color += GetBloom(uv) * 0.08;
    color *= 1500.0;


    //Tonemapping and color grading
    color = pow(color, vec3(1.5));
    color = color / (1.0 + color);
    color = pow(color, vec3(1.0 / 1.5));


    color = mix(color, color * color * (3.0 - 2.0 * color), vec3(1.0));
    color = pow(color, vec3(1.3, 1.20, 1.0));

    color = saturate(color * 1.01);

    color = pow(color, vec3(0.7 / 2.2));

    gl_FragColor = vec4(color, 1.0);
    //gl_FragColor.a = smoothstep(0.0, 0.4, mix(0.0, 0.6, gl_FragColor.r));


    //get coords and direction
    uv=fragCoord.xy/uResolution.xy-.5;
    uv.y*=uResolution.y/uResolution.x;
    vec3 dir=vec3(uv*zoom,1.);
    float time=uTime*speed+.25;

    float a1=.5/uResolution.x*2.;
    float a2=.8/uResolution.y*2.;
    mat2 rot1=mat2(cos(a1),sin(a1),-sin(a1),cos(a1));
    mat2 rot2=mat2(cos(a2),sin(a2),-sin(a2),cos(a2));
    dir.xz*=rot1;
    dir.xy*=rot2;
    vec3 from=vec3(1.,.5,0.5);
    from+=vec3(time*2.,time,-2.);
    from.xz*=rot1;
    from.xy*=rot2;

    //volumetric rendering
    float s=0.1,fade=1.;
    vec3 v=vec3(0.);
    for (int r=0; r<volsteps; r++) {
        vec3 p=from+s*dir*.5;
        p = abs(vec3(tile)-mod(p,vec3(tile*2.))); // tiling fold
        float pa,a=pa=0.;
        for (int i=0; i<iterations; i++) {
            p=abs(p)/dot(p,p)-formuparam; // the magic formula
            a+=abs(length(p)-pa); // absolute sum of average change
            pa=length(p);
        }
        float dm=max(0.,darkmatter-a*a*.001); //dark matter
        a*=a*a; // add contrast
        if (r>6) fade*=1.-dm; // dark matter, don't render near
        //v+=vec3(dm,dm*.5,0.);
        v+=fade;
        v+=vec3(s,s*s,s*s*s*s)*a*brightness*fade; // coloring based on distance
        fade*=distfading; // distance fading
        s+=stepsize;
    }
    v=mix(vec3(length(v)),v,saturation) * .005; //color adjust

    uv = fragCoord.xy/uResolution.xy - 0.5;
    uv.x *= uResolution.x / uResolution.y - 0.03;
    uv.x -= 0.03;
    float distance = length(uv);

    float innerRadius = 0.3;
    float outerRadius = 1.3;

    float mixFactor = smoothstep(innerRadius, outerRadius, distance);

    vec3 finalColor = mix(color, v, mixFactor);

    gl_FragColor = vec4(finalColor, 1.0);

}
