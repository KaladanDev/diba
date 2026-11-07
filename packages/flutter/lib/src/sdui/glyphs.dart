import 'dart:math' as math;

import 'package:flutter/widgets.dart';

/// The marks a field draws, as the web's text fields and pickers draw them:
/// its search, minus, plus, close and chevron on a 16 square, in
/// strokes 1.5 thick with round ends, and its calendar on 13 by 14, filled. Flutter's
/// were Material's icons, a different hand; the web's are not on the icon
/// list, which is Lucide's, so they are drawn here.
enum DibaGlyph {
  search,
  minus,
  plus,
  close,
  calendar,
  chevronDown,

  /// The calendar's month arrow, pointing left; mirrored for the
  /// other side.
  chevronLeft,

  /// A chosen colour swatch's tick, the web's: on a 12 square, through
  /// (2.5, 6), (5, 8.5) and (9.5, 3).
  check,
}

/// [glyph] in a [size] square, in [color]. Decorative: whatever carries it
/// says what it does.
class DibaGlyphMark extends StatelessWidget {
  const DibaGlyphMark(
    this.glyph, {
    super.key,
    required this.size,
    required this.color,
  });

  final DibaGlyph glyph;
  final double size;
  final Color color;

  @override
  Widget build(BuildContext context) => ExcludeSemantics(
    child: CustomPaint(
      size: Size.square(size),
      painter: _GlyphPainter(glyph, color),
    ),
  );
}

class _GlyphPainter extends CustomPainter {
  _GlyphPainter(this.glyph, this.color);

  final DibaGlyph glyph;
  final Color color;

  @override
  void paint(Canvas canvas, Size size) {
    final stroke = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.5
      ..strokeCap = StrokeCap.round;
    canvas.save();
    switch (glyph) {
      case DibaGlyph.search:
        canvas.scale(size.width / 16);
        // A ring between 4.5 and 6 round (7, 7), and a handle out to (14, 14)
        // from its middle.
        canvas.drawCircle(const Offset(7, 7), 5.25, stroke);
        const d = 5.25 / math.sqrt2;
        canvas.drawLine(
          const Offset(7 + d, 7 + d),
          const Offset(14, 14),
          stroke,
        );
      case DibaGlyph.minus:
        canvas.scale(size.width / 16);
        canvas.drawLine(const Offset(2.5, 8), const Offset(13.5, 8), stroke);
      case DibaGlyph.plus:
        canvas.scale(size.width / 16);
        canvas.drawLine(const Offset(2.5, 8), const Offset(13.5, 8), stroke);
        canvas.drawLine(const Offset(8, 2.5), const Offset(8, 13.5), stroke);
      case DibaGlyph.chevronDown:
        // A select's and a combo box's: down and back up, through (8, 10.5).
        canvas.scale(size.width / 16);
        canvas.drawPath(
          Path()
            ..moveTo(3.5, 6)
            ..lineTo(8, 10.5)
            ..lineTo(12.5, 6),
          stroke..strokeJoin = StrokeJoin.round,
        );
      case DibaGlyph.chevronLeft:
        // The web's, left from (10, 3.5) through (5.5, 8) and back to
        // (10, 12.5).
        canvas.scale(size.width / 16);
        canvas.drawPath(
          Path()
            ..moveTo(10, 3.5)
            ..lineTo(5.5, 8)
            ..lineTo(10, 12.5),
          stroke..strokeJoin = StrokeJoin.round,
        );
      case DibaGlyph.check:
        canvas.scale(size.width / 12);
        canvas.drawPath(
          Path()
            ..moveTo(2.5, 6)
            ..lineTo(5, 8.5)
            ..lineTo(9.5, 3),
          stroke..strokeJoin = StrokeJoin.round,
        );
      case DibaGlyph.close:
        canvas.scale(size.width / 16);
        canvas.drawLine(const Offset(4, 4), const Offset(12, 12), stroke);
        canvas.drawLine(const Offset(12, 4), const Offset(4, 12), stroke);
      case DibaGlyph.calendar:
        // The web's calendar in strokes 1.6 wide in a 20 square, as the
        // web's icon draws it: the page, 16.4 by 15 and 3.2 round, its top
        // band's line, and the two rings through its top.
        canvas.scale(size.width / 20);
        final line = Paint()
          ..color = color
          ..style = PaintingStyle.stroke
          ..strokeWidth = 1.6
          ..strokeCap = StrokeCap.round;
        canvas
          ..drawRRect(
            RRect.fromLTRBR(1.8, 3.2, 18.2, 18.2, const Radius.circular(3.2)),
            line,
          )
          ..drawLine(const Offset(1.8, 8.9), const Offset(18.2, 8.9), line)
          ..drawLine(const Offset(6.1, 1.1), const Offset(6.1, 5.3), line)
          ..drawLine(const Offset(13.9, 1.1), const Offset(13.9, 5.3), line);
    }
    canvas.restore();
  }

  @override
  bool shouldRepaint(_GlyphPainter old) =>
      old.glyph != glyph || old.color != color;
}
