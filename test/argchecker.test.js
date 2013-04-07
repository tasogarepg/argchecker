var assert = require('assert');
var fs = require('fs');
var path = require('path');
var util = require('util');

var ArgChecker = require('../lib/argchecker.js');

describe('argchecker', function() {
  describe('usage', function() {
    it('expect:a(PD),b,c(PR),XX(R),YY,ZZ(M)', function() {
      var ac = new ArgChecker({
        expect: {
          '-a': {param: 'PARAM_A', default:'1'},
          '-b': {},
          '-c': {param: 'PARAM_C', repeat: true},
          'XX': {repeat: true},
          'YY': {},
          'ZZ': {must: true}
        },
        name: 'testapp'
      });
      assert.equal(ac.usage, 'Usage: testapp [-a [PARAM_A]] [-b] [-c PARAM_C] ... [XX] ... [YY] ZZ');
    });
  });

  describe('parse', function() {
    it('expect:a | arg:a', function() {
      var ac = new ArgChecker({
        expect: {
          '-a': {}
        }
      });
      ac.check(['-a']);
      assert.equal(ac.get('-a').length, 0);
      assert.equal(ac.isOn('-a'), true);
    });

    it('expect:a,b,c | arg:a,b,c', function() {
      var ac = new ArgChecker({
        expect: {
          '-a': {},
          '-b': {},
          '-c': {}
        }
      });
      ac.check(['-a', '-b', '-c']);
      assert.equal(ac.get('-a').length, 0);
      assert.equal(ac.isOn('-a'), true);
      assert.equal(ac.get('-b').length, 0);
      assert.equal(ac.isOn('-b'), true);
      assert.equal(ac.get('-c').length, 0);
      assert.equal(ac.isOn('-c'), true);
    });

    it('expect:a,b,c | arg:a,b', function() {
      var ac = new ArgChecker({
        expect: {
          '-a': {},
          '-b': {},
          '-c': {}
        }
      });
      ac.check(['-a', '-b']);
      assert.equal(ac.get('-a').length, 0);
      assert.equal(ac.isOn('-a'), true);
      assert.equal(ac.get('-b').length, 0);
      assert.equal(ac.isOn('-b'), true);
      assert.equal(ac.get('-c'), undefined);
      assert.equal(ac.isOn('-c'), false);
    });

    it('expect:a,b,c | arg:c', function() {
      var ac = new ArgChecker({
        expect: {
          '-a': {},
          '-b': {},
          '-c': {}
        }
      });
      ac.check(['-c']);
      assert.equal(ac.get('-a'), undefined);
      assert.equal(ac.isOn('-a'), false);
      assert.equal(ac.get('-b'), undefined);
      assert.equal(ac.isOn('-b'), false);
      assert.equal(ac.get('-c').length, 0);
      assert.equal(ac.isOn('-c'), true);
    });

    it('expect:a,b,c | arg:', function() {
      var ac = new ArgChecker({
        expect: {
          '-a': {},
          '-b': {},
          '-c': {}
        }
      });
      ac.check([]);
      assert.equal(ac.get('-a'), undefined);
      assert.equal(ac.isOn('-a'), false);
      assert.equal(ac.get('-b'), undefined);
      assert.equal(ac.isOn('-b'), false);
      assert.equal(ac.get('-c'), undefined);
      assert.equal(ac.isOn('-c'), false);
    });

    it('expect:a(P) | arg:a(P)', function() {
      var ac = new ArgChecker({
        expect: {
          '-a': {param: 'PARAM_A'}
        }
      });
      ac.check(['-a', '1']);
      assert.equal(ac.get('-a'), '1');
      assert.equal(ac.isOn('-a'), true);
    });

    it('expect:a(P),b(P),c(P) | arg:a(P),b(P),c(P)', function() {
      var ac = new ArgChecker({
        expect: {
          '-a': {param: 'PARAM_A'},
          '-b': {param: 'PARAM_B'},
          '-c': {param: 'PARAM_C'}
        }
      });
      ac.check(['-a', '1', '-b', '2', '-c', '3']);
      assert.equal(ac.get('-a'), '1');
      assert.equal(ac.isOn('-a'), true);
      assert.equal(ac.get('-b'), '2');
      assert.equal(ac.isOn('-b'), true);
      assert.equal(ac.get('-c'), '3');
      assert.equal(ac.isOn('-c'), true);
    });

    it('expect:a(P),b(P),c(P) | arg:a(P),b(P)', function() {
      var ac = new ArgChecker({
        expect: {
          '-a': {param: 'PARAM_A'},
          '-b': {param: 'PARAM_B'},
          '-c': {param: 'PARAM_C'}
        }
      });
      ac.check(['-a', '1', '-b', '2']);
      assert.equal(ac.get('-a'), '1');
      assert.equal(ac.isOn('-a'), true);
      assert.equal(ac.get('-b'), '2');
      assert.equal(ac.isOn('-b'), true);
      assert.equal(ac.get('-c'), undefined);
      assert.equal(ac.isOn('-c'), false);
    });

    it('expect:a(P),b(P),c(P) | arg:c(P)', function() {
      var ac = new ArgChecker({
        expect: {
          '-a': {param: 'PARAM_A'},
          '-b': {param: 'PARAM_B'},
          '-c': {param: 'PARAM_C'}
        }
      });
      ac.check(['-c', '3']);
      assert.equal(ac.get('-a'), undefined);
      assert.equal(ac.isOn('-a'), false);
      assert.equal(ac.get('-b'), undefined);
      assert.equal(ac.isOn('-b'), false);
      assert.equal(ac.get('-c'), '3');
      assert.equal(ac.isOn('-c'), true);
    });

    it('expect:a(P),b(P),c(P) | arg:', function() {
      var ac = new ArgChecker({
        expect: {
          '-a': {param: 'PARAM_A'},
          '-b': {param: 'PARAM_B'},
          '-c': {param: 'PARAM_C'}
        }
      });
      ac.check([]);
      assert.equal(ac.get('-a'), undefined);
      assert.equal(ac.isOn('-a'), false);
      assert.equal(ac.get('-b'), undefined);
      assert.equal(ac.isOn('-b'), false);
      assert.equal(ac.get('-c'), undefined);
      assert.equal(ac.isOn('-c'), false);
    });

    it('expect:a(P),b,c(P) | arg:a(P),b,c(P)', function() {
      var ac = new ArgChecker({
        expect: {
          '-a': {param: 'PARAM_A'},
          '-b': {},
          '-c': {param: 'PARAM_C'}
        }
      });
      ac.check(['-a', '1', '-b', '-c', '3']);
      assert.equal(ac.get('-a'), '1');
      assert.equal(ac.isOn('-a'), true);
      assert.equal(ac.get('-b').length, 0);
      assert.equal(ac.isOn('-b'), true);
      assert.equal(ac.get('-c'), '3');
      assert.equal(ac.isOn('-c'), true);
    });

    it('expect:a(PD),b,c(P) | arg:a,b,c(P)', function() {
      var ac = new ArgChecker({
        expect: {
          '-a': {param: 'PARAM_A', default:'1'},
          '-b': {},
          '-c': {param: 'PARAM_C'}
        }
      });
      ac.check(['-a', '-b', '-c', '3']);
      assert.equal(ac.get('-a'), '1');
      assert.equal(ac.isOn('-a'), true);
      assert.equal(ac.get('-b').length, 0);
      assert.equal(ac.isOn('-b'), true);
      assert.equal(ac.get('-c'), '3');
      assert.equal(ac.isOn('-c'), true);
    });

    it('expect:a(PM) | arg:a(P)', function() {
      var ac = new ArgChecker({
        expect: {
          '-a': {param: 'PARAM_A', must: true}
        }
      });
      ac.check(['-a', '1']);
      assert.equal(ac.get('-a'), '1');
      assert.equal(ac.isOn('-a'), true);
    });

    it('expect:a(PM) | arg:a >> exception', function() {
      assert.throws(function() {
        var ac = new ArgChecker({
          expect: {
            '-a': {param: 'PARAM_A', must: true}
          }
        });
        ac.check(['-a']);
      })
    });

    it('expect:a | arg:a,a >> exception', function() {
      assert.throws(function() {
        var ac = new ArgChecker({
          expect: {
            '-a': {}
          }
        });
        ac.check(['-a', '-a']);
      })
    });

    it('expect:a | arg:b >> exception', function() {
      assert.throws(function() {
        var ac = new ArgChecker({
          expect: {
            '-a': {}
          }
        });
        ac.check(['-b']);
      })
    });

    it('expect:a(P) | arg:b(P) >> exception', function() {
      assert.throws(function() {
        var ac = new ArgChecker({
          expect: {
            '-a': {param: 'PARAM_A'}
          }
        });
        ac.check(['-b', 2]);
      })
    });

    it('expect:a(PR) | arg:a(P),a(P),a(P)', function() {
      var ac = new ArgChecker({
        expect: {
          '-a': {param: 'PARAM_A', repeat: true}
        }
      });
      ac.check(['-a', '1', '-a', '2', '-a', '3']);
      assert.equal(ac.get('-a').length, 3);
      assert.equal(ac.get('-a')[0], '1');
      assert.equal(ac.get('-a')[1], '2');
      assert.equal(ac.get('-a')[2], '3');
      assert.equal(ac.isOn('-a'), true);
    });

    it('expect:a(P) | arg:a(P),a(P),a(P) >> exception', function() {
      assert.throws(function() {
        var ac = new ArgChecker({
          expect: {
            '-a': {param: 'PARAM_A'}
          }
        });
        ac.check(['-a', '1', '-a', '2', '-a', '3']);
      })
    });

    it('expect:XX | arg:XX', function() {
      var ac = new ArgChecker({
        expect: {
          'XX': {}
        }
      });
      ac.check(['10']);
      assert.equal(ac.get('XX'), '10');
      assert.equal(ac.isOn('XX'), true);
    });

    it('expect:XX | arg:XX,YY >> exception', function() {
      assert.throws(function() {
        var ac = new ArgChecker({
          expect: {
            'XX': {}
          }
        });
        ac.check(['10', '20']);
      })
    });

    it('expect:XX,YY | arg:XX,YY', function() {
      var ac = new ArgChecker({
        expect: {
          'XX': {},
          'YY': {}
        }
      });
      ac.check(['10', '20']);
      assert.equal(ac.get('XX'), '10');
      assert.equal(ac.isOn('XX'), true);
      assert.equal(ac.get('YY'), '20');
      assert.equal(ac.isOn('YY'), true);
    });

    it('expect:XX,YY,ZZ | arg:XX,YY,ZZ', function() {
      var ac = new ArgChecker({
        expect: {
          'XX': {},
          'YY': {},
          'ZZ': {}
        }
      });
      ac.check(['10', '20', '30']);
      assert.equal(ac.get('XX'), '10');
      assert.equal(ac.isOn('XX'), true);
      assert.equal(ac.get('YY'), '20');
      assert.equal(ac.isOn('YY'), true);
      assert.equal(ac.get('ZZ'), '30');
      assert.equal(ac.isOn('ZZ'), true);
    });

    it('expect:XX,YY,ZZ | arg:XX,YY', function() {
      var ac = new ArgChecker({
        expect: {
          'XX': {},
          'YY': {},
          'ZZ': {}
        }
      });
      ac.check(['10', '20']);
      assert.equal(ac.get('XX'), '10');
      assert.equal(ac.isOn('XX'), true);
      assert.equal(ac.get('YY'), '20');
      assert.equal(ac.isOn('YY'), true);
      assert.equal(ac.get('ZZ'), undefined);
      assert.equal(ac.isOn('ZZ'), false);
    });

    it('expect:XX,YY,ZZ(M) | arg:XX,ZZ', function() {
      var ac = new ArgChecker({
        expect: {
          'XX': {},
          'YY': {},
          'ZZ': {must: true}
        }
      });
      ac.check(['10', '30']);
      assert.equal(ac.get('XX'), '10');
      assert.equal(ac.isOn('XX'), true);
      assert.equal(ac.get('YY'), undefined);
      assert.equal(ac.isOn('YY'), false);
      assert.equal(ac.get('ZZ'), '30');
      assert.equal(ac.isOn('ZZ'), true);
    });

    it('expect:XX(M),YY,ZZ(M) | arg:XX >> exception', function() {
      assert.throws(function() {
        var ac = new ArgChecker({
          expect: {
            'XX': {must: true},
            'YY': {},
            'ZZ': {must: true}
          }
        });
        ac.check(['10']);
      })
    });

    it('expect:XX,YY,ZZ(R) | arg:XX,YY,ZZ1,ZZ2,ZZ3', function() {
      var ac = new ArgChecker({
        expect: {
          'XX': {},
          'YY': {},
          'ZZ': {repeat: true}
        }
      });
      ac.check(['10', '20', '30', '31', '32']);
      assert.equal(ac.get('XX'), '10');
      assert.equal(ac.isOn('XX'), true);
      assert.equal(ac.get('YY'), '20');
      assert.equal(ac.isOn('YY'), true);
      assert.equal(ac.get('ZZ').length, 3);
      assert.equal(ac.get('ZZ')[0], '30');
      assert.equal(ac.get('ZZ')[1], '31');
      assert.equal(ac.get('ZZ')[2], '32');
      assert.equal(ac.isOn('ZZ'), true);
    });

    it('expect:XX,YY(R),ZZ | arg:XX,YY1,YY2,YY3,ZZ', function() {
      var ac = new ArgChecker({
        expect: {
          'XX': {},
          'YY': {repeat: true},
          'ZZ': {}
        }
      });
      ac.check(['10', '20', '21', '22', '30']);
      assert.equal(ac.get('XX'), '10');
      assert.equal(ac.isOn('XX'), true);
      assert.equal(ac.get('YY').length, 3);
      assert.equal(ac.get('YY')[0], '20');
      assert.equal(ac.get('YY')[1], '21');
      assert.equal(ac.get('YY')[2], '22');
      assert.equal(ac.isOn('YY'), true);
      assert.equal(ac.get('ZZ'), '30');
      assert.equal(ac.isOn('ZZ'), true);
    });

    it('expect:a(PD),XX(M) | arg:a,-,XX', function() {
      var ac = new ArgChecker({
        expect: {
          '-a': {param: 'PARAM_A', default:'1'},
          'XX': {must: true}
        }
      });
      ac.check(['-a', '-', '10']);
      assert.equal(ac.get('-a'), '1');
      assert.equal(ac.isOn('-a'), true);
      assert.equal(ac.get('XX'), '10');
      assert.equal(ac.isOn('XX'), true);
    });
    
    it('expect:a(PD),XX(M) | arg:a,XX >> exception', function() {
      assert.throws(function() {
        var ac = new ArgChecker({
          expect: {
            '-a': {param: 'PARAM_A', default:'1'},
            'XX': {must: true}
          }
        });
        ac.check(['-a', '10']);
      })
    });
    
    it('expect:a(PD),b,c(P),XX | arg:a,b,c(P),XX', function() {
      var ac = new ArgChecker({
        expect: {
          '-a': {param: 'PARAM_A', default:'1'},
          '-b': {},
          '-c': {param: 'PARAM_C'},
          'XX': {}
        }
      });
      ac.check(['-a', '-b', '-c', '3', '10']);
      assert.equal(ac.get('-a'), '1');
      assert.equal(ac.isOn('-a'), true);
      assert.equal(ac.get('-b').length, 0);
      assert.equal(ac.isOn('-b'), true);
      assert.equal(ac.get('-c'), '3');
      assert.equal(ac.isOn('-c'), true);
      assert.equal(ac.get('XX'), '10');
      assert.equal(ac.isOn('XX'), true);
    });

    it('expect:a(PD),b,c(P),XX,YY | arg:a,b,c(P),XX,YY', function() {
      var ac = new ArgChecker({
        expect: {
          '-a': {param: 'PARAM_A', default:'1'},
          '-b': {},
          '-c': {param: 'PARAM_C'},
          'XX': {},
          'YY': {}
        }
      });
      ac.check(['-a', '-b', '-c', '3', '10', '20']);
      assert.equal(ac.get('-a'), '1');
      assert.equal(ac.isOn('-a'), true);
      assert.equal(ac.get('-b').length, 0);
      assert.equal(ac.isOn('-b'), true);
      assert.equal(ac.get('-c'), '3');
      assert.equal(ac.isOn('-c'), true);
      assert.equal(ac.get('XX'), '10');
      assert.equal(ac.isOn('XX'), true);
      assert.equal(ac.get('YY'), '20');
      assert.equal(ac.isOn('YY'), true);
    });

    it('expect:a(PD),b,c(P),XX,YY | arg:a,b,c(P),XX', function() {
      var ac = new ArgChecker({
        expect: {
          '-a': {param: 'PARAM_A', default:'1'},
          '-b': {},
          '-c': {param: 'PARAM_C'},
          'XX': {},
          'YY': {}
        }
      });
      ac.check(['-a', '-b', '-c', '3', '10']);
      assert.equal(ac.get('-a'), '1');
      assert.equal(ac.isOn('-a'), true);
      assert.equal(ac.get('-b').length, 0);
      assert.equal(ac.isOn('-b'), true);
      assert.equal(ac.get('-c'), '3');
      assert.equal(ac.isOn('-c'), true);
      assert.equal(ac.get('XX'), '10');
      assert.equal(ac.isOn('XX'), true);
      assert.equal(ac.get('YY'), undefined);
      assert.equal(ac.isOn('YY'), false);
    });

    it('expect:a(PD),b,c(P),XX,YY(M) | arg:a,b,c(P),YY', function() {
      var ac = new ArgChecker({
        expect: {
          '-a': {param: 'PARAM_A', default:'1'},
          '-b': {},
          '-c': {param: 'PARAM_C'},
          'XX': {},
          'YY': {must: true}
        }
      });
      ac.check(['-a', '-b', '-c', '3', '20']);
      assert.equal(ac.get('-a'), '1');
      assert.equal(ac.isOn('-a'), true);
      assert.equal(ac.get('-b').length, 0);
      assert.equal(ac.isOn('-b'), true);
      assert.equal(ac.get('-c'), '3');
      assert.equal(ac.isOn('-c'), true);
      assert.equal(ac.get('XX'), undefined);
      assert.equal(ac.isOn('XX'), false);
      assert.equal(ac.get('YY'), '20');
      assert.equal(ac.isOn('YY'), true);
    });

    it('expect:a(PD),b,c(P),XX(R),YY(M) | arg:a,b,c(P),XX1,XX2,XX3,YY', function() {
      var ac = new ArgChecker({
        expect: {
          '-a': {param: 'PARAM_A', default:'1'},
          '-b': {},
          '-c': {param: 'PARAM_C'},
          'XX': {repeat: true},
          'YY': {must: true}
        }
      });
      ac.check(['-a', '-b', '-c', '3', '10', '11', '12', '20']);
      assert.equal(ac.get('-a'), '1');
      assert.equal(ac.isOn('-a'), true);
      assert.equal(ac.get('-b').length, 0);
      assert.equal(ac.isOn('-b'), true);
      assert.equal(ac.get('-c'), '3');
      assert.equal(ac.isOn('-c'), true);
      assert.equal(ac.get('XX').length, 3);
      assert.equal(ac.get('XX')[0], '10');
      assert.equal(ac.get('XX')[1], '11');
      assert.equal(ac.get('XX')[2], '12');
      assert.equal(ac.isOn('XX'), true);
      assert.equal(ac.get('YY'), '20');
      assert.equal(ac.isOn('YY'), true);
    });

    it('expect:a(PD),b,c(P),XX(M),YY(R) | arg:a,b,c(P),XX,YY1,YY2,YY3', function() {
      var ac = new ArgChecker({
        expect: {
          '-a': {param: 'PARAM_A', default:'1'},
          '-b': {},
          '-c': {param: 'PARAM_C'},
          'XX': {must: true},
          'YY': {repeat: true}
        }
      });
      ac.check(['-a', '-b', '-c', '3', '10', '20', '21', '22']);
      assert.equal(ac.get('-a'), '1');
      assert.equal(ac.isOn('-a'), true);
      assert.equal(ac.get('-b').length, 0);
      assert.equal(ac.isOn('-b'), true);
      assert.equal(ac.get('-c'), '3');
      assert.equal(ac.isOn('-c'), true);
      assert.equal(ac.get('XX'), '10');
      assert.equal(ac.isOn('XX'), true);
      assert.equal(ac.get('YY').length, 3);
      assert.equal(ac.get('YY')[0], '20');
      assert.equal(ac.get('YY')[1], '21');
      assert.equal(ac.get('YY')[2], '22');
      assert.equal(ac.isOn('YY'), true);
    });

    it('expect:a(PD),b,c(PR),XX(R),YY(M) | arg:a,b,c(P),c(P),c(P),XX1,XX2,XX3,YY', function() {
      var ac = new ArgChecker({
        expect: {
          '-a': {param: 'PARAM_A', default:'1'},
          '-b': {},
          '-c': {param: 'PARAM_C', repeat: true},
          'XX': {repeat: true},
          'YY': {must: true}
        }
      });
      ac.check(['-a', '-b', '-c', '3', '-c', '4', '-c', '5', '10', '11', '12', '20']);
      assert.equal(ac.get('-a'), '1');
      assert.equal(ac.isOn('-a'), true);
      assert.equal(ac.get('-b').length, 0);
      assert.equal(ac.isOn('-b'), true);
      assert.equal(ac.get('-c').length, 3);
      assert.equal(ac.get('-c')[0], '3');
      assert.equal(ac.get('-c')[1], '4');
      assert.equal(ac.get('-c')[2], '5');
      assert.equal(ac.isOn('-c'), true);
      assert.equal(ac.get('XX').length, 3);
      assert.equal(ac.get('XX')[0], '10');
      assert.equal(ac.get('XX')[1], '11');
      assert.equal(ac.get('XX')[2], '12');
      assert.equal(ac.isOn('XX'), true);
      assert.equal(ac.get('YY'), '20');
      assert.equal(ac.isOn('YY'), true);
    });

    it('expect:a(PD),b,c(PR),XX(R),YY(M) | arg:XX1,a,b,c(P),c(P),c(P),XX2,XX3,YY', function() {
      var ac = new ArgChecker({
        expect: {
          '-a': {param: 'PARAM_A', default:'1'},
          '-b': {},
          '-c': {param: 'PARAM_C', repeat: true},
          'XX': {repeat: true},
          'YY': {must: true}
        }
      });
      ac.check(['10', '-a', '-b', '-c', '3', '-c', '4', '-c', '5', '11', '12', '20']);
      assert.equal(ac.get('-a'), '1');
      assert.equal(ac.isOn('-a'), true);
      assert.equal(ac.get('-b').length, 0);
      assert.equal(ac.isOn('-b'), true);
      assert.equal(ac.get('-c').length, 3);
      assert.equal(ac.get('-c')[0], '3');
      assert.equal(ac.get('-c')[1], '4');
      assert.equal(ac.get('-c')[2], '5');
      assert.equal(ac.isOn('-c'), true);
      assert.equal(ac.get('XX').length, 3);
      assert.equal(ac.get('XX')[0], '10');
      assert.equal(ac.get('XX')[1], '11');
      assert.equal(ac.get('XX')[2], '12');
      assert.equal(ac.isOn('XX'), true);
      assert.equal(ac.get('YY'), '20');
      assert.equal(ac.isOn('YY'), true);
    });

    it('expect:a(PD),b,c(PR),XX(R),YY(M),ZZ | arg:XX1,a,b,c(P),c(P),c(P),XX2,YY,ZZ', function() {
      var ac = new ArgChecker({
        expect: {
          '-a': {param: 'PARAM_A', default:'1'},
          '-b': {},
          '-c': {param: 'PARAM_C', repeat: true},
          'XX': {repeat: true},
          'YY': {must: true},
          'ZZ': {}
        }
      });
      ac.check(['10', '-a', '-b', '-c', '3', '-c', '4', '-c', '5', '11', '20', '30']);
      assert.equal(ac.get('-a'), '1');
      assert.equal(ac.isOn('-a'), true);
      assert.equal(ac.get('-b').length, 0);
      assert.equal(ac.isOn('-b'), true);
      assert.equal(ac.get('-c').length, 3);
      assert.equal(ac.get('-c')[0], '3');
      assert.equal(ac.get('-c')[1], '4');
      assert.equal(ac.get('-c')[2], '5');
      assert.equal(ac.isOn('-c'), true);
      assert.equal(ac.get('XX').length, 2);
      assert.equal(ac.get('XX')[0], '10');
      assert.equal(ac.get('XX')[1], '11');
      assert.equal(ac.isOn('XX'), true);
      assert.equal(ac.get('YY'), '20');
      assert.equal(ac.isOn('YY'), true);
      assert.equal(ac.get('ZZ'), '30');
      assert.equal(ac.isOn('ZZ'), true);
    });

    it('expect:a(PD),b,c(PR),XX(R),YY(M),ZZ | arg:XX,a,b,c(P),c(P),c(P),YY', function() {
      var ac = new ArgChecker({
        expect: {
          '-a': {param: 'PARAM_A', default:'1'},
          '-b': {},
          '-c': {param: 'PARAM_C', repeat: true},
          'XX': {repeat: true},
          'YY': {must: true},
          'ZZ': {}
        }
      });
      ac.check(['10', '-a', '-b', '-c', '3', '-c', '4', '-c', '5', '20']);
      assert.equal(ac.get('-a'), '1');
      assert.equal(ac.isOn('-a'), true);
      assert.equal(ac.get('-b').length, 0);
      assert.equal(ac.isOn('-b'), true);                                
      assert.equal(ac.get('-c').length, 3);
      assert.equal(ac.get('-c')[0], '3');
      assert.equal(ac.get('-c')[1], '4');
      assert.equal(ac.get('-c')[2], '5');
      assert.equal(ac.isOn('-c'), true);
      assert.equal(ac.get('XX'), '10');
      assert.equal(ac.isOn('XX'), true);
      assert.equal(ac.get('YY'), '20');
      assert.equal(ac.isOn('YY'), true);
      assert.equal(ac.get('ZZ'), undefined);
      assert.equal(ac.isOn('ZZ'), false);
    });

    it('expect:a(PD),b,c(PR),XX(R),YY,ZZ(M) | arg:XX,a,b,c(P),c(P),c(P),ZZ', function() {
      var ac = new ArgChecker({
        expect: {
          '-a': {param: 'PARAM_A', default:'1'},
          '-b': {},
          '-c': {param: 'PARAM_C', repeat: true},
          'XX': {repeat: true},
          'YY': {},
          'ZZ': {must: true}
        }
      });
      ac.check(['10', '-a', '-b', '-c', '3', '-c', '4', '-c', '5', '30']);
      assert.equal(ac.get('-a'), '1');
      assert.equal(ac.isOn('-a'), true);
      assert.equal(ac.get('-b').length, 0);
      assert.equal(ac.isOn('-b'), true);                                
      assert.equal(ac.get('-c').length, 3);
      assert.equal(ac.get('-c')[0], '3');
      assert.equal(ac.get('-c')[1], '4');
      assert.equal(ac.get('-c')[2], '5');
      assert.equal(ac.isOn('-c'), true);
      assert.equal(ac.get('XX'), '10');
      assert.equal(ac.isOn('XX'), true);
      assert.equal(ac.get('YY'), undefined);
      assert.equal(ac.isOn('YY'), false);
      assert.equal(ac.get('ZZ'), '30');
      assert.equal(ac.isOn('ZZ'), true);
    });

    it('expect:a(PD),b,c(PR),XX(M),YY,ZZ(M) | arg:XX,a,b,c(P),c(P),YY,ZZ1,ZZ2 >> exception', function() {
      assert.throws(function() {
        var ac = new ArgChecker({
          expect: {
            'XX': {must: true},
            'YY': {},
            'ZZ': {must: true}
          }
        });
        ac.check(['10', '-a', '-b', '-c', '3', '-c', '4', '20', '31', '32']);
      })
    });

  });

});
