    angular.module('cadastroVendasApp', [])

    // ── Diretiva: mascara ─────────────────────────────────────────
    .directive('mascara', function() {
      return {
        restrict: 'A',
        require: '?ngModel',
        link: function(scope, element, attrs, ngModel) {
          var maskType = attrs.mascara;
          function applyMask(input, mask) {
            var raw = input.value.replace(/\D/g, '');
            var out = '';
            if (mask === 'cpf') {
              raw = raw.slice(0, 11);
              if (raw.length > 9) out = raw.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
              else if (raw.length > 6) out = raw.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
              else if (raw.length > 3) out = raw.replace(/(\d{3})(\d{1,3})/, '$1.$2');
              else out = raw;
            } else if (mask === 'date') {
              raw = raw.slice(0, 8);
              if (raw.length > 4) out = raw.replace(/(\d{2})(\d{2})(\d{1,4})/, '$1/$2/$3');
              else if (raw.length > 2) out = raw.replace(/(\d{2})(\d{1,2})/, '$1/$2');
              else out = raw;
            } else if (mask === 'phone') {
              raw = raw.slice(0, 11);
              if (raw.length > 7) out = raw.replace(/(\d{2})(\d{5})(\d{1,4})/, '($1) $2-$3');
              else if (raw.length > 2) out = raw.replace(/(\d{2})(\d{1,5})/, '($1) $2');
              else if (raw.length > 0) out = '(' + raw;
              else out = raw;
            } else if (mask === 'phone-fix') {
              raw = raw.slice(0, 10);
              if (raw.length > 6) out = raw.replace(/(\d{2})(\d{4})(\d{1,4})/, '($1) $2-$3');
              else if (raw.length > 2) out = raw.replace(/(\d{2})(\d{1,4})/, '($1) $2');
              else if (raw.length > 0) out = '(' + raw;
              else out = raw;
            } else if (mask === 'rg') {
              raw = raw.slice(0, 9);
              if (raw.length > 8) out = raw.replace(/(\d{2})(\d{3})(\d{3})(\d{1})/, '$1.$2.$3-$4');
              else if (raw.length > 5) out = raw.replace(/(\d{2})(\d{3})(\d{1,3})/, '$1.$2.$3');
              else if (raw.length > 2) out = raw.replace(/(\d{2})(\d{1,3})/, '$1.$2');
              else out = raw;
            } else if (mask === 'cep') {
              raw = raw.slice(0, 8);
              if (raw.length > 5) out = raw.replace(/(\d{5})(\d{1,3})/, '$1-$2');
              else out = raw;
            } else if (mask === 'currency') {
              raw = raw.replace(/^0+/, '') || '0';
              var cents = raw.padStart(3, '0');
              var intPart = cents.slice(0, -2).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
              out = (intPart || '0') + ',' + cents.slice(-2);
            } else if (mask === 'nome') {
              out = input.value.replace(/\d/g, '');
            }
            input.value = out;
          }
          element.on('input', function() {
            applyMask(element[0], maskType);
            if (ngModel) {
              ngModel.$setViewValue(element[0].value);
              scope.$apply();
            }
          });
        }
      };
    })

;
