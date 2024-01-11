uniform float uTime;
uniform vec4 uMouse;
uniform vec2 uResolution;
uniform sampler2D uBuffer1;
uniform sampler2D uBuffer2;
uniform sampler2D uBuffer3;
uniform sampler2D uBuffer4;

varying vec2 vUv;

//First bloom pass, mipmap tree thing

vec3 ColorFetch(vec2 coord)
{
    return texture(uBuffer1, coord).rgb;
}

vec3 Grab1(vec2 coord, const float octave, const vec2 offset)
{
    float scale = exp2(octave);

    coord += offset;
    coord *= scale;

    if (coord.x < 0.0 || coord.x > 1.0 || coord.y < 0.0 || coord.y > 1.0)
    {
        return vec3(0.0);
    }

    vec3 color = ColorFetch(coord);

    return color;
}

vec3 Grab4(vec2 coord, const float octave, const vec2 offset)
{
    float scale = exp2(octave);

    coord += offset;
    coord *= scale;

    if (coord.x < 0.0 || coord.x > 1.0 || coord.y < 0.0 || coord.y > 1.0)
    {
        return vec3(0.0);
    }

    vec3 color = vec3(0.0);
    float weights = 0.0;

    const int oversampling = 4;

    for (int i = 0; i < oversampling; i++)
    {
        for (int j = 0; j < oversampling; j++)
        {
            vec2 off = (vec2(i, j) / uResolution.xy + vec2(0.0) / uResolution.xy) * scale / float(oversampling);
            color += ColorFetch(coord + off);


            weights += 1.0;
        }
    }

    color /= weights;

    return color;
}

vec3 Grab8(vec2 coord, const float octave, const vec2 offset)
{
    float scale = exp2(octave);

    coord += offset;
    coord *= scale;

    if (coord.x < 0.0 || coord.x > 1.0 || coord.y < 0.0 || coord.y > 1.0)
    {
        return vec3(0.0);
    }

    vec3 color = vec3(0.0);
    float weights = 0.0;

    const int oversampling = 8;

    for (int i = 0; i < oversampling; i++)
    {
        for (int j = 0; j < oversampling; j++)
        {
            vec2 off = (vec2(i, j) / uResolution.xy + vec2(0.0) / uResolution.xy) * scale / float(oversampling);
            color += ColorFetch(coord + off);


            weights += 1.0;
        }
    }

    color /= weights;

    return color;
}

vec3 Grab16(vec2 coord, const float octave, const vec2 offset)
{
    float scale = exp2(octave);

    coord += offset;
    coord *= scale;

    if (coord.x < 0.0 || coord.x > 1.0 || coord.y < 0.0 || coord.y > 1.0)
    {
        return vec3(0.0);
    }

    vec3 color = vec3(0.0);
    float weights = 0.0;

    const int oversampling = 16;

    for (int i = 0; i < oversampling; i++)
    {
        for (int j = 0; j < oversampling; j++)
        {
            vec2 off = (vec2(i, j) / uResolution.xy + vec2(0.0) / uResolution.xy) * scale / float(oversampling);
            color += ColorFetch(coord + off);


            weights += 1.0;
        }
    }

    color /= weights;

    return color;
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

void main()
{
    vec2 uv = vUv;

    vec3 color = vec3(0.0);

    /*
    Create a mipmap tree thingy with padding to prevent leaking bloom

	Since there's no mipmaps for the previous buffer and the reduction process has to be done in one pass,
    oversampling is required for a proper result
	*/
    color += Grab1(uv, 1.0, vec2(0.0,  0.0)   );
    color += Grab4(uv, 2.0, vec2(CalcOffset(1.0))   );
    color += Grab8(uv, 3.0, vec2(CalcOffset(2.0))   );
    color += Grab16(uv, 4.0, vec2(CalcOffset(3.0))   );
    color += Grab16(uv, 5.0, vec2(CalcOffset(4.0))   );
    color += Grab16(uv, 6.0, vec2(CalcOffset(5.0))   );
    color += Grab16(uv, 7.0, vec2(CalcOffset(6.0))   );
    color += Grab16(uv, 8.0, vec2(CalcOffset(7.0))   );


    gl_FragColor = vec4(color, 1.0);
}
