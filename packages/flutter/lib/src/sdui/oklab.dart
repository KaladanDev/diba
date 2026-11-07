import 'dart:math' as math;

import 'package:flutter/painting.dart';

/// Two colours mixed in Oklab, as CSS's `color-mix(in oklab, a pa, b pb)`:
/// shares over a whole are scaled to it, and under one leave the rest clear.
Color dibaMixOklab(Color a, double pa, Color b, double pb) {
  final sum = pa + pb;
  final wa = pa / sum;
  final wb = pb / sum;
  final x = _oklab(a);
  final y = _oklab(b);
  final alpha = a.a * wa + b.a * wb;
  // Premultiplied, as color-mix interpolates.
  final mixed = [
    for (var i = 0; i < 3; i++)
      alpha == 0 ? 0.0 : (x[i] * a.a * wa + y[i] * b.a * wb) / alpha,
  ];
  return _fromOklab(mixed, alpha * math.min(sum, 1));
}

double _linear(double c) =>
    c <= 0.04045 ? c / 12.92 : math.pow((c + 0.055) / 1.055, 2.4).toDouble();

double _gamma(double c) => c <= 0.0031308
    ? 12.92 * c
    : 1.055 * math.pow(c, 1 / 2.4).toDouble() - 0.055;

double _cbrt(double v) =>
    v < 0 ? -math.pow(-v, 1 / 3).toDouble() : math.pow(v, 1 / 3).toDouble();

List<double> _oklab(Color c) {
  final r = _linear(c.r), g = _linear(c.g), b = _linear(c.b);
  final l = _cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  final m = _cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  final s = _cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s,
  ];
}

Color _fromOklab(List<double> lab, double alpha) {
  final l = math.pow(lab[0] + 0.3963377774 * lab[1] + 0.2158037573 * lab[2], 3);
  final m = math.pow(lab[0] - 0.1055613458 * lab[1] - 0.0638541728 * lab[2], 3);
  final s = math.pow(lab[0] - 0.0894841775 * lab[1] - 1.2914855480 * lab[2], 3);
  double channel(num v) => _gamma(v.toDouble()).clamp(0.0, 1.0);
  return Color.from(
    alpha: alpha.clamp(0.0, 1.0),
    red: channel(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    green: channel(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    blue: channel(-0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s),
  );
}
