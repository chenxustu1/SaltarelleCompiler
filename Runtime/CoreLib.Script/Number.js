///////////////////////////////////////////////////////////////////////////////
// Number Extensions

ss.formatNumber = function#? DEBUG ss$formatNumber##(num, format, typePrecision) {
	if (ss.isNullOrUndefined(format) || (format.length == 0) || (format == 'i')) {
		return num.toString();
	}
	return ss.netFormatNumber(num, format, ss_CultureInfo.invariantCulture.numberFormat, typePrecision);
};

ss.localeFormatNumber = function#? DEBUG ss$localeFormatNumber##(num, format) {
	if (ss.isNullOrUndefined(format) || (format.length == 0) || (format == 'i')) {
		return num.toLocaleString();
	}
	return ss.netFormatNumber(num, format, ss_CultureInfo.currentCulture.numberFormat);
};

ss._commaFormatNumber = function#? DEBUG ss$_commaFormat##(number, groups, decimal, comma) {
	var decimalPart = null;
	var decimalIndex = number.indexOf(decimal);
	if (decimalIndex > 0) {
		decimalPart = number.substr(decimalIndex);
		number = number.substr(0, decimalIndex);
	}

	var negative = ss.startsWithString(number, '-');
	if (negative) {
		number = number.substr(1);
	}

	var groupIndex = 0;
	var groupSize = groups[groupIndex];
	if (number.length < groupSize) {
		return (negative ? '-' : '') + (decimalPart ? number + decimalPart : number);
	}

	var index = number.length;
	var s = '';
	var done = false;
	while (!done) {
		var length = groupSize;
		var startIndex = index - length;
		if (startIndex < 0) {
			groupSize += startIndex;
			length += startIndex;
			startIndex = 0;
			done = true;
		}
		if (!length) {
			break;
		}
		
		var part = number.substr(startIndex, length);
		if (s.length) {
			s = part + comma + s;
		}
		else {
			s = part;
		}
		index -= length;

		if (groupIndex < groups.length - 1) {
			groupIndex++;
			groupSize = groups[groupIndex];
		}
	}

	if (negative) {
		s = '-' + s;
	}    
	return decimalPart ? s + decimalPart : s;
};

ss.netFormatNumber = function#? DEBUG ss$netFormatNumber##(num, format, numberFormat, typePrecision) {
	var nf = (numberFormat && numberFormat.getFormat(ss_NumberFormatInfo)) || ss_CultureInfo.currentCulture.numberFormat;

	var s = '';    
	var precision = -1;
	
	if (format.length > 1) {
		precision = parseInt(format.substr(1));
	}

	var fs = format.charAt(0);
	switch (fs) {
		case 'd': case 'D':
			s = parseInt(Math.abs(num)).toString();
			if (precision != -1) {
				s = ss.padLeftString(s, precision, 0x30);
			}
			if (num < 0) {
				s = '-' + s;
			}
			break;
		case 'x': case 'X':
			s = parseInt(Math.abs(num)).toString(16);
			if (fs == 'X') {
				s = s.toUpperCase();
			}
			if (precision != -1) {
				s = ss.padLeftString(s, precision, 0x30);
			}
			break;
		case 'e': case 'E':
			if (precision == -1) {
				s = num.toExponential();
			}
			else {
				s = num.toExponential(precision);
			}
			if (fs == 'E') {
				s = s.toUpperCase();
			}
			break;
		case 'f': case 'F':
		case 'n': case 'N':
			if (precision == -1) {
				precision = nf.numberDecimalDigits;
			}
			s = num.toFixed(Math.max(0, Math.min(precision, 20))).toString();
			if (precision && (nf.numberDecimalSeparator != '.')) {
				var index = s.indexOf('.');
				s = s.substr(0, index) + nf.numberDecimalSeparator + s.substr(index + 1);
			}
			if ((fs == 'n') || (fs == 'N')) {
				s = ss._commaFormatNumber(s, nf.numberGroupSizes, nf.numberDecimalSeparator, nf.numberGroupSeparator);
			}
			break;
		case 'c': case 'C':
			if (precision == -1) {
				precision = nf.currencyDecimalDigits;
			}
			s = Math.abs(num).toFixed(precision).toString();
			if (precision && (nf.currencyDecimalSeparator != '.')) {
				var index = s.indexOf('.');
				s = s.substr(0, index) + nf.currencyDecimalSeparator + s.substr(index + 1);
			}
			s = ss._commaFormatNumber(s, nf.currencyGroupSizes, nf.currencyDecimalSeparator, nf.currencyGroupSeparator);
			if (num < 0) {
				s = ss.formatString(nf.currencyNegativePattern, s);
			}
			else {
				s = ss.formatString(nf.currencyPositivePattern, s);
			}
			break;
		case 'p': case 'P':
			if (precision == -1) {
				precision = nf.percentDecimalDigits;
			}
			s = (Math.abs(num) * 100.0).toFixed(precision).toString();
			if (precision && (nf.percentDecimalSeparator != '.')) {
				var index = s.indexOf('.');
				s = s.substr(0, index) + nf.percentDecimalSeparator + s.substr(index + 1);
			}
			s = ss._commaFormatNumber(s, nf.percentGroupSizes, nf.percentDecimalSeparator, nf.percentGroupSeparator);
			if (num < 0) {
				s = ss.formatString(nf.percentNegativePattern, s);
			}
			else {
				s = ss.formatString(nf.percentPositivePattern, s);
			}
			break;
	    case 'g': case 'G':
	        if (precision == -1) {
	            // The default ToString method for Single, etc. inlines the correct default precision
	            // which is dependant on the number type. For all other 'g' calls we can't detect the
	            // number type. Therefore we always use the Single precision of 7.
	            precision = typePrecision ? typePrecision : 7;
	        }
	        
	        s = num.toExponential(Math.max(0, Math.min(precision - 1, 20)));
	        var index = s.indexOf('e');
	        var expMoves = parseInt(s.substr(index + 1));
	        if (expMoves > -5 && expMoves < precision) {
	            var precisionWithoutIntDigits = precision - expMoves - 1;
	            s = ss.netFormatNumber(num, (fs == 'G' ? "F" : "f") + precisionWithoutIntDigits, numberFormat);
	            while (s.substr(s.length - 1) == '0' ||
	                   s.substr(s.length - 1) == nf.numberDecimalSeparator ||
	                   s.substr(s.length - 1) == '.') {
	                s = s.substr(0, s.length - 1);
	            }
	        }
	        else {
	            if (fs == 'G') {
	                s = s.toUpperCase();
	            }
	            if (expMoves < 10) {
	                s = s.substr(0, s.length - 1) + '0' + s.substr(s.length - 1);
	            }
	            var zeroCheckIndex = index - 1;
	            while (s.substr(zeroCheckIndex, 1) == '0' ||
	                   s.substr(zeroCheckIndex, 1) == nf.numberDecimalSeparator ||
	                   s.substr(zeroCheckIndex, 1) == '.') {
	                s = s.substr(0, zeroCheckIndex) + s.substr(zeroCheckIndex + 1);
	                zeroCheckIndex--;
	            }
	        }
	        break;
	}

	return s;
};
