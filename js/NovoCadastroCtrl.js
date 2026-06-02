    // ── Dados dinâmicos (via props/API em produção) ────────────
    var appData = {
      storeName: 'Meu Crediário - Módulo de Vendas - Teste',   // TODO: receber da API/props
      storeId:   '3943',         // TODO: receber da API/props
      userName:  'Usuário',      // TODO: receber da API/props
      // TODO: $http.get('/api/financeiro/cliente') — null = sem histórico
      financeiro: null,
      // Exemplo com dados:
      // financeiro: {
      //   parcelasPagasQtd: 12,    parcelasPagasTotal: '1.440,00',
      //   parcelasAbertasQtd: 3,   parcelasAbertasTotal: '360,00',
      //   parcelasVencidasQtd: 1,  parcelasVencidasTotal: '120,00',
      //   jurosPagos: '18,50',     multasPagas: '6,00',
      //   mediaCompra: '480,00',   totalComprado: '1.800,00',
      // },
    };
    document.getElementById('hd-store-name').textContent = appData.storeName;
    document.getElementById('hd-store-id').textContent   = 'ID: ' + appData.storeId;
    document.getElementById('hd-user-name').textContent  = appData.userName;

    // ── Módulos (via API em produção) ──────────────────────────
    var modulos = [
      { titulo: 'Assinatura', img: 'img/ilustracao-assinatura.svg', url: 'https://assinatura.meucrediario.com.br/' },
      { titulo: 'Cobrança',   img: 'img/ilustracao-cobranca.svg',   url: 'https://cobranca.meucrediario.com.br/'  },
    ];
    var modulosGrid = document.getElementById('hd-modulos-grid');
    modulos.forEach(function(mod) {
      var a = document.createElement('a');
      a.className = 'hd-modulo-btn';
      a.href = mod.url;
      a.target = '_blank';
      a.title = 'Módulo ' + mod.titulo;
      a.innerHTML = '<img class="hd-modulo-img" src="' + mod.img + '" alt="' + mod.titulo + '"><span class="hd-modulo-label">' + mod.titulo + '</span>';
      modulosGrid.appendChild(a);
    });

    // ── Navegação ──────────────────────────────────────────────
    // Estratégia: checkpoint sequencial — ativa a última seção cujo topo
    // cruzou a linha de referência. Progressão seção-a-seção garantida por
    // geometria: ir de N para N+2 exige passar pelo ponto onde N+1 cruzou a linha.
    var _navScrolling = false;
    var _scrollTarget = null;
    var _contextualLock = null;  // scrollY da posição quando ação contextual foi disparada

    // Scroll-spy: checkpoint sequencial com limiar assimétrico por direção
    (function() {
      var SECTION_IDS    = ['sec-identificacao','sec-endereco','sec-contato','sec-ocupacao','sec-referencias','sec-observacoes'];
      var HEADER_H       = 75;
      var ENTRY_LINE     = HEADER_H + 30;  // 105px — descendo: ativa ao ver ~1 campo novo
      var BACK_THRESHOLD = HEADER_H + 140; // 215px — subindo: só troca quando ~3 campos da seção anterior estão visíveis
      var navBtns   = null;
      var ticking   = false;
      var activeIdx = 0;

      function setActive(idx) {
        activeIdx = idx;
        navBtns.forEach(function(b, i) { b.classList.toggle('nav-item--active', i === idx); });
      }

      function updateNav() {
        ticking = false;

        // Liberação antecipada: se chegamos perto do alvo, solta o flag sem esperar o timeout
        if (_navScrolling && _scrollTarget !== null) {
          if (Math.abs(window.pageYOffset - _scrollTarget) < 10) {
            _navScrolling = false;
            _scrollTarget = null;
          }
        }
        if (_navScrolling) return;

        // Bloqueio contextual: quando o usuário executa uma ação explícita (ex.: "Adicionar
        // observação"), a intenção dele tem prioridade sobre o recálculo geométrico.
        // O bloqueio se mantém até um deslocamento intencional de scroll (≥ 150px).
        if (_contextualLock !== null) {
          if (Math.abs(window.pageYOffset - _contextualLock) < 150) return;
          _contextualLock = null;  // deslocamento suficiente — libera o bloqueio
        }

        // Checkpoint: última seção cujo topo cruzou a linha de entrada.
        var candidate = 0;
        for (var i = 0; i < SECTION_IDS.length; i++) {
          var el = document.getElementById(SECTION_IDS[i]);
          if (!el) continue;
          if (el.getBoundingClientRect().top <= ENTRY_LINE) {
            candidate = i;
          }
        }

        if (candidate === activeIdx) return;

        if (candidate > activeIdx) {
          // Avançando (descendo): troca imediata — a nova seção já entrou na linha de referência
          setActive(candidate);
        } else {
          // Recuando (subindo): só troca quando a seção atual recuou o suficiente,
          // sinalizando intenção clara de voltar — evita troca precipitada a cada pixel
          var activeSec = document.getElementById(SECTION_IDS[activeIdx]);
          if (activeSec && activeSec.getBoundingClientRect().top > BACK_THRESHOLD) {
            setActive(candidate);
          }
        }
      }

      function onScroll() {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(updateNav);
        }
      }

      function init() {
        navBtns = Array.from(document.querySelectorAll('.nav-item'));
        window.addEventListener('scroll', onScroll, { passive: true });
        updateNav();
      }

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
      } else {
        init();
      }
    })();

    // ── Foco nos campos → atualiza navegação rápida ───────────────
    (function() {
      var SECTION_IDS = ['sec-identificacao','sec-endereco','sec-contato','sec-ocupacao','sec-referencias','sec-observacoes'];
      var formArea = document.querySelector('.form-area');
      if (!formArea) return;
      formArea.addEventListener('focusin', function(e) {
        var t = e.target;
        if (!t || (t.tagName !== 'INPUT' && t.tagName !== 'SELECT' && t.tagName !== 'TEXTAREA')) return;
        var section = t.closest('section[id]');
        if (!section) return;
        var idx = SECTION_IDS.indexOf(section.id);
        if (idx < 0) return;
        if (_navScrolling) return;
        document.querySelectorAll('.nav-item').forEach(function(b, i) {
          b.classList.toggle('nav-item--active', i === idx);
        });
      });
    })();

    // ── Botões "Adicionar" → ativação contextual imediata da nav ─────────────
    (function() {
      var SECTION_IDS = ['sec-identificacao','sec-endereco','sec-contato','sec-ocupacao','sec-referencias','sec-observacoes'];
      function activateNav(sectionId) {
        if (_navScrolling) return;
        var idx = SECTION_IDS.indexOf(sectionId);
        if (idx < 0) return;
        _contextualLock = window.pageYOffset;
        document.querySelectorAll('.nav-item').forEach(function(b, i) {
          b.classList.toggle('nav-item--active', i === idx);
        });
      }
      var btnRef = document.getElementById('btn-adicionar-ref');
      if (btnRef) {
        btnRef.addEventListener('click', function() { activateNav('sec-referencias'); });
      }
      var secObs = document.getElementById('sec-observacoes');
      if (secObs) {
        secObs.addEventListener('click', function(e) {
          var btn = e.target.closest('button[ng-click]');
          if (btn && btn.getAttribute('ng-click').indexOf('obsModoEdicao') >= 0) {
            activateNav('sec-observacoes');
          }
        });
      }
    })();

    // ── AngularJS App ─────────────────────────────────────────────

    // ── Controller principal ──────────────────────────────────────
    angular.module('cadastroVendasApp')
    .controller('CadastroCtrl', ['$scope', '$timeout', '$http', function($scope, $timeout, $http) {

      // ── Estado do formulário ─────────────────────────────────
      $scope.form        = {};
      $scope.exibeConjuge = false;
      $scope.referencias  = [];
      $scope.vinculoOpts  = ['Amigo(a)','Vizinho(a)','Namorado(a)','Esposo(a)','Cunhado(a)','Genro/Nora','Filho(a)','Irmão(ã)','Mãe','Pai','Padrasto','Madrasta','Avô(ó)','Primo(a)','Sobrinho(a)','Sogro(a)','Tio(a)','Outro'];
      $scope.obsState     = 'empty';
      $scope.obs          = { texto: '', tags: [] };

      // ── Interações do header ─────────────────────────────────
      var dropdownAberto = false;
      var modulosAberto  = false;
      $scope.toggleDropdown = function() { dropdownAberto = !dropdownAberto; modulosAberto = false; _syncHeader(); };
      $scope.toggleModulos  = function() { modulosAberto = !modulosAberto; dropdownAberto = false; _syncHeader(); };
      $scope.fecharTudo     = function() { dropdownAberto = false; modulosAberto = false; _syncHeader(); };
      function _syncHeader() {
        document.getElementById('hd-user-wrap').classList.toggle('open', dropdownAberto);
        document.getElementById('hd-modulos-popover').classList.toggle('open', modulosAberto);
        document.getElementById('hd-overlay').style.display = (dropdownAberto || modulosAberto) ? 'block' : 'none';
      }

      var _idTimer = null;
      $scope.copiarId = function() {
        var texto = appData.storeId;
        if (navigator.clipboard) {
          navigator.clipboard.writeText(texto);
        } else {
          var el = document.createElement('textarea');
          el.value = texto; document.body.appendChild(el); el.select();
          document.execCommand('copy'); document.body.removeChild(el);
        }
        var icon  = document.getElementById('hd-id-icon');
        var check = document.getElementById('hd-id-check');
        icon.style.display = 'none'; check.style.display = '';
        if (_idTimer) clearTimeout(_idTimer);
        _idTimer = setTimeout(function() { icon.style.display = ''; check.style.display = 'none'; }, 2000);
      };

      // ── Watchers: campos obrigatórios → habilitam botões do footer ──────
      $scope.$watch('form.nome', function() { $timeout(function() { updateCount(); }); });

      // ── Validação de datas ────────────────────────────────────────────────
      $scope.cpfVal = {
        cpf:     { erro: false, msg: '' },
        cpfConj: { erro: false, msg: '' }
      };

      $scope.nomeVal  = { nome:  { erro: false, msg: '' } };
      $scope.emailVal = { email: { erro: false, msg: '' } };
      $scope.phoneVal = {
        celular:  { erro: false, msg: '' },
        telRes:   { erro: false, msg: '' },
        telCom:   { erro: false, msg: '' },
        outroTel: { erro: false, msg: '' }
      };

      $scope.dateVal = {
        nasc:      { erro: false, aviso: false, msg: '' },
        rgEmissao: { erro: false, aviso: false, msg: '' },
        nascConj:  { erro: false, aviso: false, msg: '' }
      };

      function isLeapYear(y) { return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0; }
      function daysInMonth(m, y) {
        return [31, isLeapYear(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1];
      }
      function parseDateStr(str) {
        if (!str || str.length !== 10) return null;
        var p = str.split('/');
        if (p.length !== 3) return null;
        var d = parseInt(p[0], 10), m = parseInt(p[1], 10), y = parseInt(p[2], 10);
        if (isNaN(d) || isNaN(m) || isNaN(y)) return null;
        if (m < 1 || m > 12 || d < 1 || d > daysInMonth(m, y)) return null;
        var date = new Date(); date.setFullYear(y, m - 1, d);
        return (date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d) ? date : null;
      }
      function calcAge(date) {
        var today = new Date(), age = today.getFullYear() - date.getFullYear();
        if (today.getMonth() < date.getMonth() || (today.getMonth() === date.getMonth() && today.getDate() < date.getDate())) age--;
        return age;
      }
      function clearDateVal(key) { $scope.dateVal[key] = { erro: false, aviso: false, msg: '' }; }

      function validateNasc(val) {
        clearDateVal('nasc');
        if (!val || val.length < 10) return;
        var y = parseInt(val.split('/')[2], 10), today = new Date();
        var date = parseDateStr(val);
        if (!date)        { $scope.dateVal.nasc.erro = true; $scope.dateVal.nasc.msg = 'Data inválida'; return; }
        if (y < 1900)     { $scope.dateVal.nasc.erro = true; $scope.dateVal.nasc.msg = 'Ano inválido (mín. 1900)'; return; }
        if (date > today) { $scope.dateVal.nasc.erro = true; $scope.dateVal.nasc.msg = 'Data não pode ser no futuro'; return; }
        var age = calcAge(date);
        if (age < 18) { $scope.dateVal.nasc.aviso = true; $scope.dateVal.nasc.msg = 'Menor de idade (' + age + ' anos)'; }
        // Revalida emissão do RG reativamente
        if ($scope.form.rgEmissao && $scope.form.rgEmissao.length === 10) validateRgEmissao($scope.form.rgEmissao);
      }

      function validateRgEmissao(val) {
        clearDateVal('rgEmissao');
        if (!val || val.length < 10) return;
        var y = parseInt(val.split('/')[2], 10), today = new Date();
        var date = parseDateStr(val);
        if (!date)        { $scope.dateVal.rgEmissao.erro = true; $scope.dateVal.rgEmissao.msg = 'Data inválida'; return; }
        if (y < 1940)     { $scope.dateVal.rgEmissao.erro = true; $scope.dateVal.rgEmissao.msg = 'Ano inválido (mín. 1940)'; return; }
        if (date > today) { $scope.dateVal.rgEmissao.erro = true; $scope.dateVal.rgEmissao.msg = 'Data não pode ser no futuro'; return; }
        var nascStr = $scope.form.nascimento;
        if (nascStr && nascStr.length === 10) {
          var nascDate = parseDateStr(nascStr);
          if (nascDate && date < nascDate) { $scope.dateVal.rgEmissao.erro = true; $scope.dateVal.rgEmissao.msg = 'Data anterior ao nascimento'; }
        }
      }

      function validateNascConj(val) {
        clearDateVal('nascConj');
        if (!val || val.length < 10) return;
        var y = parseInt(val.split('/')[2], 10), today = new Date();
        var date = parseDateStr(val);
        if (!date)        { $scope.dateVal.nascConj.erro = true; $scope.dateVal.nascConj.msg = 'Data inválida'; return; }
        if (y < 1900)     { $scope.dateVal.nascConj.erro = true; $scope.dateVal.nascConj.msg = 'Ano inválido (mín. 1900)'; return; }
        if (date > today) { $scope.dateVal.nascConj.erro = true; $scope.dateVal.nascConj.msg = 'Data não pode ser no futuro'; return; }
        var age = calcAge(date);
        if (age < 16) { $scope.dateVal.nascConj.erro = true; $scope.dateVal.nascConj.msg = 'Idade mínima: 16 anos'; }
      }

      $scope.$watch('form.nascimento', function(val) {
        if (!val || val.length === 0) { clearDateVal('nasc'); return; }
        if (val.length === 10) validateNasc(val); else clearDateVal('nasc');
      });
      $scope.$watch('form.rgEmissao', function(val) {
        if (!val || val.length === 0) { clearDateVal('rgEmissao'); return; }
        if (val.length === 10) validateRgEmissao(val); else clearDateVal('rgEmissao');
      });
      $scope.$watch('form.nascConjuge', function(val) {
        if (!val || val.length === 0) { clearDateVal('nascConj'); return; }
        if (val.length === 10) validateNascConj(val); else clearDateVal('nascConj');
      });

      // ── Validação de CPF ──────────────────────────────────────────────────
      function clearCpfVal(key) { $scope.cpfVal[key] = { erro: false, msg: '' }; }

      function validarDigitosCpf(digits) {
        if (/^(\d)\1{10}$/.test(digits)) return false;
        var soma = 0, resto;
        for (var i = 0; i < 9; i++) soma += parseInt(digits[i]) * (10 - i);
        resto = (soma * 10) % 11;
        if (resto === 10 || resto === 11) resto = 0;
        if (resto !== parseInt(digits[9])) return false;
        soma = 0;
        for (var i = 0; i < 10; i++) soma += parseInt(digits[i]) * (11 - i);
        resto = (soma * 10) % 11;
        if (resto === 10 || resto === 11) resto = 0;
        return resto === parseInt(digits[10]);
      }

      function validateCpf(val, key) {
        clearCpfVal(key);
        if (!validarDigitosCpf(val.replace(/\D/g, ''))) {
          $scope.cpfVal[key].erro = true;
          $scope.cpfVal[key].msg  = 'CPF inválido';
        }
        $timeout(function() { updateCount(); });
      }

      $scope.$watch('form.cpf', function(val) {
        if (!val || val.length === 0) { clearCpfVal('cpf'); $timeout(function() { updateCount(); }); return; }
        if (val.length === 14) validateCpf(val, 'cpf'); else clearCpfVal('cpf');
      });
      $scope.$watch('form.cpfConjuge', function(val) {
        if (!val || val.length === 0) { clearCpfVal('cpfConj'); return; }
        if (val.length === 14) validateCpf(val, 'cpfConj'); else clearCpfVal('cpfConj');
      });

      // ── Validação: Nome, E-mail e Telefones (on blur) ─────────────────────
      $scope.validateNomeBlur = function() {
        var val = ($scope.form.nome || '').trim();
        $scope.nomeVal.nome = val.length === 0
          ? { erro: true, msg: 'Informação obrigatória' }
          : { erro: false, msg: '' };
        $timeout(function() { updateCount(); });
      };

      $scope.validateEmailBlur = function() {
        var val = ($scope.form.email || '').trim();
        if (!val) { $scope.emailVal.email = { erro: false, msg: '' }; return; }
        var valido = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val);
        $scope.emailVal.email = valido
          ? { erro: false, msg: '' }
          : { erro: true, msg: 'Dado inválido' };
      };

      $scope.validatePhoneBlur = function(key, maxLen) {
        var val = $scope.form[key] || '';
        if (!val || val.length === 0) { $scope.phoneVal[key] = { erro: false, msg: '' }; return; }
        $scope.phoneVal[key] = val.length < maxLen
          ? { erro: true, msg: 'Dado inválido' }
          : { erro: false, msg: '' };
      };

      // ── Situação conjugal ─────────────────────────────────────
      $scope.toggleConjuge = function(valor) {
        $scope.exibeConjuge = valor === 'Casado(a)' || valor === 'União estável';
        if (!$scope.exibeConjuge) {
          $scope.form.cpfConjuge = ''; $scope.form.nomeConjuge = '';
          $scope.form.nascConjuge = ''; $scope.form.celConjuge = '';
        }
        $timeout(function() { updateCount(); });
      };

      // ── Scroll para seção ─────────────────────────────────────
      $scope.scrollToSection = function(id, $event) {
        var btn = $event.currentTarget;
        document.querySelectorAll('.nav-item').forEach(function(b) { b.classList.remove('nav-item--active'); });
        btn.classList.add('nav-item--active');
        var el = document.getElementById(id);
        if (!el) return;
        var top = el.getBoundingClientRect().top + window.pageYOffset - 75;
        _navScrolling = true; _scrollTarget = top; _contextualLock = null;
        window.scrollTo({ top: top, behavior: 'smooth' });
        clearTimeout(window._navScrollTimer);
        window._navScrollTimer = setTimeout(function() { _navScrolling = false; _scrollTarget = null; }, 1200);
      };

      // ── Espelho do cliente ────────────────────────────────────
      function escapeHtml(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
      function normStr(s) { return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
      function valById(id) {
        var el = document.getElementById(id); if (!el) return '';
        if (el.tagName === 'SELECT') { var opt = el.options[el.selectedIndex]; var txt = opt ? opt.text.trim() : ''; return txt === 'Selecione' ? '' : txt; }
        return el.value.trim();
      }
      function disp(v) { return v || '<span class="espelho-field-value empty">Não informado</span>'; }
      function ef(label, id) { return '<div class="espelho-field"><div class="espelho-field-label">' + label + '</div><div class="espelho-field-value">' + disp(valById(id)) + '</div></div>'; }
      function subsec(label) { return '<div class="espelho-subsection"><span>' + label + '</span><div class="espelho-subsection-line"></div></div>'; }
      function finCard(title, subs, total) {
        var subsHtml = subs.map(function(s) { return '<div class="espelho-fin-cell-sub">' + s + '</div>'; }).join('');
        return '<div class="espelho-fin-cell"><div class="espelho-fin-cell-title">' + title + '</div>' + subsHtml + (total != null ? '<div class="espelho-fin-cell-total">' + total + '</div>' : '') + '</div>';
      }
      $scope.abrirEspelho = function() {
        var nome = valById('f-nome'), cpf = valById('f-cpf');
        document.getElementById('espelho-subtitle').textContent = (nome || 'Cliente') + (cpf ? ' | CPF ' + cpf : '');
        var body = document.getElementById('espelho-body');
        var fin = appData.financeiro || {};
        var f = function(k, def) { return (appData.financeiro && fin[k] != null) ? fin[k] : def; };
        body.innerHTML = [
          '<div class="espelho-section"><div class="espelho-section-title">Identificação</div>',
          subsec('Informações pessoais'),
          '<div class="espelho-grid">', ef('Nome completo','f-nome'), ef('CPF','f-cpf'), ef('Data de nascimento','f-nascimento'), ef('RG','f-rg'), ef('Órgão emissor RG','f-rg-orgao'), ef('Estado emissor RG','f-rg-estado'), ef('Data de emissão RG','f-rg-emissao'), '</div>',
          subsec('Informações complementares'),
          '<div class="espelho-grid">', ef('Gênero','f-genero'), ef('Nome completo da mãe','f-mae'), ef('Nome completo do pai','f-pai'), ef('Nível de escolaridade','f-escolaridade'), ef('Possui dependentes?','f-dependentes'), ef('Possui carro?','f-carro'), ef('Possui moto?','f-moto'), '</div>',
          subsec('Situação conjugal'), '<div class="espelho-grid">', ef('Estado civil atual','f-estado-civil'), '</div></div>',
          '<hr class="espelho-divider">',
          '<div class="espelho-section"><div class="espelho-section-title">Endereço</div><div class="espelho-grid">', ef('Cidade','inp-cidade'), ef('CEP','inp-cep'), ef('Logradouro','f-logradouro'), ef('Número','f-numero'), ef('Bairro','f-bairro'), ef('Complemento','f-complemento'), ef('Referência','f-referencia-end'), ef('Tempo de residência','f-tempo-residencia'), ef('Situação da residência','f-situacao-residencia'), '</div></div>',
          '<hr class="espelho-divider">',
          '<div class="espelho-section"><div class="espelho-section-title">Contato</div><div class="espelho-grid">', ef('Celular','f-celular'), ef('E-mail','f-email'), ef('Telefone residencial','f-tel-res'), ef('Telefone comercial','f-tel-com'), ef('Outro telefone','f-outro-tel'), '</div></div>',
          '<hr class="espelho-divider">',
          '<div class="espelho-section"><div class="espelho-section-title">Ocupação</div><div class="espelho-grid">', ef('Profissão','f-profissao'), ef('Empresa onde trabalha','f-empresa'), ef('Tempo de empresa','f-tempo-empresa'), ef('Salário líquido','f-salario'), '</div></div>',
          '<hr class="espelho-divider">',
          '<div class="espelho-section"><div class="espelho-section-title">Referências</div><p style="font-size:14px;color:#333;margin:0">Nenhuma referência adicionada.</p></div>',
          '<hr class="espelho-divider">',
          '<div class="espelho-section"><div class="espelho-section-title">Informações financeiras</div><div class="espelho-fin-wrapper">',
            '<div class="espelho-financeiro"><div class="espelho-fin-row">',
              finCard('Parcelas pagas',['Quantidade: '+f('parcelasPagasQtd','0')],'Total: R$ '+f('parcelasPagasTotal','0,00')),
              finCard('Parcelas abertas',['Quantidade: '+f('parcelasAbertasQtd','0')],'Total: R$ '+f('parcelasAbertasTotal','0,00')),
              finCard('Parcelas vencidas',['Quantidade: '+f('parcelasVencidasQtd','0')],'Total: R$ '+f('parcelasVencidasTotal','0,00')),
            '</div></div>',
            '<div class="espelho-financeiro"><div class="espelho-fin-row">',
              finCard('Encargos de atraso',['Juros pagos: R$ '+f('jurosPagos','0,00'),'Multas pagas: R$ '+f('multasPagas','0,00')],null),
              finCard('Compras',['Média de compra: R$ '+f('mediaCompra','0,00'),'Total comprado: R$ '+f('totalComprado','0,00')],null),
            '</div></div>',
            (!appData.financeiro ? '<div class="espelho-fin-note">Ainda não temos informações sobre os pagamentos do cliente.</div>' : ''),
          '</div></div>'
        ].join('');
        document.getElementById('espelho-overlay').classList.add('open');
        body.scrollTop = 0;
      };
      $scope.fecharEspelho = function() { document.getElementById('espelho-overlay').classList.remove('open'); };
      $scope.handleEspelhoOverlayClick = function($event) { if ($event.target === document.getElementById('espelho-overlay')) $scope.fecharEspelho(); };
      $scope.espelhoImprimir = function() { window.print(); };

      // ── Referências ───────────────────────────────────────────
      $scope.adicionarRef = function() {
        if ($scope.referencias.length >= 2) return;
        $scope.referencias.push({ nome: '', vinculo: '', celular: '', telefone: '' });
        $timeout(function() { updateCount(); });
      };
      $scope.removerRef = function(idx) { $scope.referencias.splice(idx, 1); $timeout(function() { updateCount(); }); };

      // ── Observações ───────────────────────────────────────────
      $scope.obsModoEdicao = function() {
        $scope.obsState = 'editing';
        $timeout(function() { var inp = document.getElementById('obs-input'); if (inp) inp.focus(); updateCount(); });
      };
      $scope.obsCancelar = function() { $scope.obsState = 'empty'; $scope.obs.tags = []; $scope.obs.texto = ''; $timeout(function() { updateCount(); }); };
      $scope.obsRemoverTag = function(idx) { $scope.obs.tags.splice(idx, 1); if ($scope.obs.tags.length === 0) $scope.obsState = 'editing'; $timeout(function() { updateCount(); }); };
      $scope.obsKeydown = function($event) {
        if ($event.key === 'Enter') {
          $event.preventDefault();
          var v = ($scope.obs.texto || '').trim(); if (!v) return;
          $scope.obs.tags.push(v); $scope.obs.texto = ''; $scope.obsState = 'has-tags';
          $timeout(function() { updateCount(); });
        }
      };

      // ── Helpers: lock/unlock campos de endereço ───────────────
      function lockCep() {
        document.getElementById('ctrl-cep').classList.add('ctrl--disabled');
        var el = document.getElementById('inp-cep'); el.disabled = true; el.value = '';
        if (listaCep) listaCep.classList.remove('open');
      }
      function unlockCep() { document.getElementById('ctrl-cep').classList.remove('ctrl--disabled'); document.getElementById('inp-cep').disabled = false; }
      function lockNumero() { var el = document.getElementById('f-numero'); el.disabled = true; el.closest('.ctrl').classList.add('ctrl--disabled'); }
      function unlockNumero() { var el = document.getElementById('f-numero'); el.disabled = false; el.closest('.ctrl').classList.remove('ctrl--disabled'); }
      function lockAddrDeps() {
        document.querySelectorAll('.addr-dep').forEach(function(el) { el.disabled = true; var c = el.closest('.ctrl'); if (c) c.classList.add('ctrl--disabled'); });
      }
      function unlockAddrDeps() {
        document.querySelectorAll('.addr-dep').forEach(function(el) { el.disabled = false; var c = el.closest('.ctrl'); if (c) c.classList.remove('ctrl--disabled'); });
      }

      // ── Status do cadastro ─────────────────────────────────────
      var STATUS_CONFIG = {
        incompleto: { label: 'INCOMPLETO', pos: 0, desc: 'O cadastro ainda não possui informações suficientes para a análise.' },
        basico:     { label: 'BÁSICO',     pos: 1, desc: 'O cadastro contém informações iniciais. Complemente para melhorar a análise.' },
        desejavel:  { label: 'DESEJÁVEL',  pos: 2, desc: 'O cadastro já possui dados adequados para uma boa análise.' },
        completo:   { label: 'COMPLETO',   pos: 3, desc: 'Parabéns! O cadastro está completo e pronto para análise.' }
      };
      function getStatus(filled) {
        if (filled >= 40) return 'completo'; if (filled >= 25) return 'desejavel'; if (filled >= 15) return 'basico'; return 'incompleto';
      }
      function renderStatusPills(status) {
        var cfg = STATUS_CONFIG[status], container = document.getElementById('status-pills');
        container.innerHTML = '';
        for (var i = 0; i < 4; i++) {
          if (i === cfg.pos) { var badge = document.createElement('span'); badge.className = 'status-pill-badge status-pill-badge--' + status; badge.textContent = cfg.label; container.appendChild(badge); }
          else { var bar = document.createElement('div'); bar.className = 'status-pill-bar'; container.appendChild(bar); }
        }
        document.getElementById('status-desc').textContent = cfg.desc;
      }
      function getAllFields() {
        return Array.from(document.querySelectorAll('.form-area input:not([disabled]), .form-area select:not([disabled])')).filter(function(el) { return !el.closest('.ctrl--disabled'); });
      }
      function updateCount() {
        var fields = getAllFields(), total = fields.length;
        var filled = fields.filter(function(el) { return el.tagName === 'SELECT' ? el.value !== '' : el.value.trim() !== ''; }).length;
        document.getElementById('fields-total').textContent = total;
        document.getElementById('fields-count').innerHTML = filled + '/<span id="fields-total">' + total + '</span>';
        renderStatusPills(getStatus(filled));
        var cpfEl = document.getElementById('f-cpf'), nomeEl = document.getElementById('f-nome');
        var canSubmit = cpfEl && cpfEl.value.replace(/\D/g,'').length === 11 && !$scope.cpfVal.cpf.erro && nomeEl && nomeEl.value.trim().length > 0 && !$scope.nomeVal.nome.erro;
        var btnA = document.getElementById('btn-analisar'), btnV = document.getElementById('btn-vender'), btnS = document.getElementById('btn-salvar');
        btnA.classList.toggle('enabled', canSubmit); btnV.classList.toggle('enabled', canSubmit); btnS.classList.toggle('enabled', canSubmit);
        if (canSubmit) { btnV.style.background = '#337ab7'; btnV.style.borderColor = '#2e6da4'; }
        else { btnV.style.background = ''; btnV.style.borderColor = ''; }
      }

      // ── Autocomplete utilities ─────────────────────────────────
      function setCtrlLoading(ctrlId, on) { var el = document.getElementById(ctrlId); if (!el) return; el.classList.toggle('ctrl--loading', on); }
      function highlightText(text, query) {
        if (!query) return escapeHtml(text);
        var normT = normStr(text), normQ = normStr(query), idx = normT.indexOf(normQ);
        if (idx < 0) return escapeHtml(text);
        return escapeHtml(text.slice(0,idx)) + '<mark class="ac-mark">' + escapeHtml(text.slice(idx, idx+query.length)) + '</mark>' + escapeHtml(text.slice(idx+query.length));
      }
      function navLista(e, lista, onSelect) {
        var items = lista.querySelectorAll('.autocomplete-item:not(.autocomplete-item--empty):not(.autocomplete-item--error)');
        if (!items.length || !lista.classList.contains('open')) return;
        var cur = lista.querySelector('.autocomplete-item--active'), idx = Array.from(items).indexOf(cur);
        if (e.key === 'ArrowDown') { e.preventDefault(); idx = Math.min(idx+1, items.length-1); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); idx = Math.max(idx-1, 0); }
        else if (e.key === 'Enter' && cur) { e.preventDefault(); onSelect(cur); return; }
        else if (e.key === 'Escape') { lista.classList.remove('open'); return; }
        else { return; }
        if (cur) cur.classList.remove('autocomplete-item--active');
        if (items[idx]) { items[idx].classList.add('autocomplete-item--active'); items[idx].scrollIntoView({ block: 'nearest' }); }
      }


      // ── Endereço: Cidade (IBGE) + CEP/Rua (ViaCEP) ─────────────
      var _cidadesCache    = null;
      var _cidadeSelecionada = null;
      var _cidadeIdx       = -1;
      var _cepTimer        = null;

      function getUfFromMunicipio(m) {
        try { return m.microrregiao.mesorregiao.UF.sigla; } catch(e) {}
        try { return m['regiao-imediata']['regiao-intermediaria'].UF.sigla; } catch(e) {}
        return '';
      }
      function carregarCidades(cb) {
        if (_cidadesCache) { cb(_cidadesCache); return; }
        setCtrlLoading('ctrl-cidade', true);
        $http.get('https://servicodados.ibge.gov.br/api/v1/localidades/municipios?orderBy=nome')
          .then(function(resp) {
            _cidadesCache = resp.data.map(function(m) { return { nome: m.nome, uf: getUfFromMunicipio(m) }; }).filter(function(c) { return c.uf; });
            setCtrlLoading('ctrl-cidade', false); cb(_cidadesCache);
          }).catch(function(e) { setCtrlLoading('ctrl-cidade', false); console.error('IBGE error:', e); });
      }

      var inpCidade   = document.getElementById('inp-cidade');
      var listaCidade = document.getElementById('lista-cidade');
      var inpCep      = document.getElementById('inp-cep');
      var listaCep    = document.getElementById('lista-cep');

      inpCidade.addEventListener('focus', function() { carregarCidades(function(){}); });
      inpCidade.addEventListener('input', function() {
        _cidadeSelecionada = null; lockCep(); lockNumero(); lockAddrDeps();
        var q = this.value.trim();
        if (q.length < 2) { listaCidade.classList.remove('open'); updateCount(); return; }
        var norm = normStr(q);
        carregarCidades(function(lista) {
          var res = lista.filter(function(c) { return normStr(c.nome).startsWith(norm) || normStr(c.nome + ' ' + c.uf).includes(norm); }).slice(0, 9);
          renderListaCidade(res, q); updateCount();
        });
      });
      inpCidade.addEventListener('blur',    function() { setTimeout(function() { listaCidade.classList.remove('open'); }, 160); });
      inpCidade.addEventListener('keydown', function(e) { navLista(e, listaCidade, function(item) { item.dispatchEvent(new Event('mousedown')); }); });

      function renderListaCidade(cidades, query) {
        listaCidade.innerHTML = '';
        if (!cidades.length) { listaCidade.innerHTML = '<div class="autocomplete-item autocomplete-item--empty">Nenhuma cidade encontrada</div>'; listaCidade.classList.add('open'); return; }
        cidades.forEach(function(c) {
          var item = document.createElement('div'); item.className = 'autocomplete-item';
          item.innerHTML = highlightText(c.nome + ' \u2013 ' + c.uf, query || '');
          item.addEventListener('mousedown', function(e) { e.preventDefault(); selecionarCidade(c); });
          listaCidade.appendChild(item);
        });
        listaCidade.classList.add('open'); _cidadeIdx = -1;
      }
      function selecionarCidade(c) {
        inpCidade.value = c.nome + ' \u2013 ' + c.uf; _cidadeSelecionada = c;
        listaCidade.classList.remove('open'); unlockCep(); unlockNumero(); updateCount();
      }

      inpCep.addEventListener('input', function() {
        clearTimeout(_cepTimer); lockAddrDeps();
        var v = this.value.trim(), digits = v.replace(/\D/g, '');
        if (/^\d[\d\-]*$/.test(v)) {
          if (digits.length <= 5) this.value = digits;
          else if (digits.length <= 8) this.value = digits.slice(0,5) + '-' + digits.slice(5);
          v = this.value.trim(); digits = v.replace(/\D/g,'');
        }
        if (digits.length === 8 && /^\d{5}-\d{3}$/.test(v)) {
          listaCep.classList.remove('open'); setCtrlLoading('ctrl-cep', true);
          _cepTimer = setTimeout(function() { buscarPorCep(digits); }, 350);
        } else if (v.length >= 3 && !/^\d/.test(v)) {
          setCtrlLoading('ctrl-cep', true);
          _cepTimer = setTimeout(function() { buscarPorRua(v); }, 600);
        } else { setCtrlLoading('ctrl-cep', false); listaCep.classList.remove('open'); }
        updateCount();
      });
      inpCep.addEventListener('blur',    function() { setTimeout(function() { listaCep.classList.remove('open'); }, 160); });
      inpCep.addEventListener('keydown', function(e) { navLista(e, listaCep, function(item) { item.dispatchEvent(new Event('mousedown')); }); });

      function buscarPorCep(cep) {
        $http.get('https://viacep.com.br/ws/' + cep + '/json/').then(function(resp) {
          setCtrlLoading('ctrl-cep', false);
          if (resp.data.erro) { mostrarErroCep('CEP n\u00e3o encontrado.'); return; }
          preencherEndereco(resp.data);
        }).catch(function() { setCtrlLoading('ctrl-cep', false); mostrarErroCep('Erro ao consultar CEP.'); });
      }
      function buscarPorRua(rua) {
        if (!_cidadeSelecionada) { setCtrlLoading('ctrl-cep', false); return; }
        var url = 'https://viacep.com.br/ws/' + _cidadeSelecionada.uf + '/' + encodeURIComponent(_cidadeSelecionada.nome) + '/' + encodeURIComponent(rua) + '/json/';
        $http.get(url).then(function(resp) {
          setCtrlLoading('ctrl-cep', false);
          if (!Array.isArray(resp.data) || !resp.data.length) { listaCep.innerHTML = '<div class="autocomplete-item autocomplete-item--empty">Nenhum endere\u00e7o encontrado</div>'; listaCep.classList.add('open'); return; }
          renderListaCep(resp.data.slice(0, 8), rua);
        }).catch(function() { setCtrlLoading('ctrl-cep', false); });
      }
      function renderListaCep(enderecos, query) {
        listaCep.innerHTML = '';
        enderecos.forEach(function(e) {
          var item = document.createElement('div'); item.className = 'autocomplete-item';
          var cepFmt = e.cep ? e.cep.replace(/(\d{5})(\d{3})/, '$1-$2') : '';
          item.innerHTML = '<strong>' + highlightText(e.logradouro || '', query || '') + '</strong>' +
            (e.complemento ? ', ' + escapeHtml(e.complemento) : '') +
            '<span class="autocomplete-cep-sub">' + escapeHtml(e.bairro || '') + (e.bairro && cepFmt ? ' &nbsp;\u00b7&nbsp; ' : '') + cepFmt + '</span>';
          item.addEventListener('mousedown', function(ev) { ev.preventDefault(); inpCep.value = cepFmt; listaCep.classList.remove('open'); preencherEndereco(e); });
          listaCep.appendChild(item);
        });
        listaCep.classList.add('open');
      }
      function preencherEndereco(d) {
        document.getElementById('f-logradouro').value = d.logradouro || '';
        document.getElementById('f-bairro').value     = d.bairro     || '';
        unlockAddrDeps(); updateCount();
      }
      function mostrarErroCep(msg) {
        listaCep.innerHTML = '<div class="autocomplete-item autocomplete-item--error">' + msg + '</div>';
        listaCep.classList.add('open'); setTimeout(function() { listaCep.classList.remove('open'); }, 2800);
      }

      // ── Profiss\u00e3o autocomplete (lista est\u00e1tica CBO) ─────────────
      var PROFISSOES = [
        'A\u00e7ougueiro','Administrador','Advogado','Agente administrativo','Agente de sa\u00fade',
        'Agente de seguran\u00e7a','Agente de viagens','Agente funер\u00e1rio','Agricultor','Agr\u00f4nomo',
        'Almoxarife','Analista de sistemas','Analista financeiro','Analista de RH','Analista de marketing',
        'Analista de suporte','Analista de dados','Aposentado','Arquiteto','Arquivista',
        'Assistente administrativo','Assistente cont\u00e1bil','Assistente jur\u00eddico','Assistente social',
        'Atendente','Ator','Auditor','Aut\u00f4nomo','Auxiliar administrativo','Auxiliar de cozinha',
        'Auxiliar de enfermagem','Auxiliar de escrit\u00f3rio','Auxiliar de produ\u00e7\u00e3o','Auxiliar de servi\u00e7os gerais',
        'Avicultor','Azulejista','Banc\u00e1rio','Barbeiro','Bi\u00f3logo','Biom\u00e9dico','Bioqu\u00edmico','Bombeiro','Borracheiro',
        'Cabeleireiro','Carpinteiro','Carteiro','Chapista','Chef de cozinha','Cobrador','Comerciante',
        'Consultor','Consultor de TI','Contador','Copeiro','Corretor de im\u00f3veis','Corretor de seguros',
        'Costureiro','Cozinheiro','Dan\u00e7arino','Decorador','Dentista','Designer','Designer gr\u00e1fico',
        'Designer de interiores','Diretor comercial','Diretor financeiro','Dom\u00e9stica',
        'Economista','Educador f\u00edsico','Eletricista','Enfermeiro','Engenheiro civil',
        'Engenheiro el\u00e9trico','Engenheiro mec\u00e2nico','Engenheiro de produ\u00e7\u00e3o','Engenheiro de software',
        'Engenheiro qu\u00edmico','En\u00f3logo','Esteticista','Farmac\u00eautico','Fisioterapeuta','Floricultor',
        'Fonoaudi\u00f3logo','Fot\u00f3grafo','Frentista','Funcion\u00e1rio p\u00fablico','Gar\u00e7om','Ge\u00f3grafo','Ge\u00f3logo',
        'Gerente comercial','Gerente de produ\u00e7\u00e3o','Gestor de TI','Historiador','Hoteleiro',
        'Industri\u00e1rio','Inspetor de qualidade','Instrumentador cir\u00fargiJco','Jardineiro','Jornalista','Juiz',
        'Lavrador','Locutor','Manicure','Marceneiro','Marinheiro','Mec\u00e2nico','M\u00e9dico','M\u00e9dico veterin\u00e1rio',
        'Mergulhador','Meteorologista','Militar','Motorista','M\u00fasico','Nutricionista','Odontol\u00f3go',
        'Operador de caixa','Operador de m\u00e1quinas','Operador de telemarketing','Ortoptista','Otorrinolaringologista',
        'Padeiro','Pedagogo','Pedreiro','Personal trainer','Pescador','Pintor','Pipoqueiro','Porteiro',
        'Professor','Produtor audiovisual','Produtor rural','Programador','Promotor de vendas',
        'Psic\u00f3logo','Psiquiatra','Publicit\u00e1rio','Qu\u00edmico','Recepcionista','Repositor',
        'Representante comercial','Retificador','R\u00e1dio-t\u00e9cnico','Seguran\u00e7a','Serralheiro',
        'Servidor p\u00fablico','Soci\u00f3logo','Soldador','Supervisor','Tapeceiro','T\u00e9cnico agr\u00edcola',
        'T\u00e9cnico de enfermagem','T\u00e9cnico de inform\u00e1tica','T\u00e9cnico de laborat\u00f3rio','T\u00e9cnico de manuten\u00e7\u00e3o',
        'T\u00e9cnico de radiologia','T\u00e9cnico em seguran\u00e7a do trabalho','Tecn\u00f3logo','Terapeuta ocupacional',
        'Torneiro mec\u00e2nico','Tradutor','Transportador','Tratorista','Vendedor','Veterin\u00e1rio','Vigilante'
      ];

      var inpProfissao   = document.getElementById('f-profissao');
      var listaProfissao = document.getElementById('lista-profissao');

      inpProfissao.addEventListener('input', function() {
        var q = this.value.trim();
        if (q.length < 2) { listaProfissao.classList.remove('open'); updateCount(); return; }
        var norm = normStr(q);
        var res  = PROFISSOES.filter(function(p) { return normStr(p).includes(norm); }).slice(0, 9);
        renderListaProfissao(res, q); updateCount();
      });
      inpProfissao.addEventListener('blur',    function() { setTimeout(function() { listaProfissao.classList.remove('open'); }, 160); });
      inpProfissao.addEventListener('keydown', function(e) { navLista(e, listaProfissao, function(item) { item.dispatchEvent(new Event('mousedown')); }); });

      function renderListaProfissao(profissoes, query) {
        listaProfissao.innerHTML = '';
        if (!profissoes.length) { listaProfissao.innerHTML = '<div class="autocomplete-item autocomplete-item--empty">Nenhuma profiss\u00e3o encontrada</div>'; listaProfissao.classList.add('open'); return; }
        profissoes.forEach(function(p) {
          var item = document.createElement('div'); item.className = 'autocomplete-item';
          item.innerHTML = highlightText(p, query || '');
          item.addEventListener('mousedown', function(e) { e.preventDefault(); inpProfissao.value = p; listaProfissao.classList.remove('open'); updateCount(); });
          listaProfissao.appendChild(item);
        });
        listaProfissao.classList.add('open');
      }

      // ── Hover do Vender (inline-style managed) ───────────────────
      $timeout(function() {
        var btnV = document.getElementById('btn-vender');
        if (btnV) {
          btnV.addEventListener('mouseenter', function() { if (this.classList.contains('enabled')) { this.style.background = '#2e6da4'; this.style.borderColor = '#2e6da4'; } });
          btnV.addEventListener('mouseleave', function() { if (this.classList.contains('enabled')) { this.style.background = '#337ab7'; this.style.borderColor = '#2e6da4'; } });
        }
        updateCount();
      });

    }]); // end CadastroCtrl / end module


    // ── Atalhos de teclado ────────────────────────────────────
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') document.querySelector('.btn-cancel').click();
    });
