import sys

# Pilote MySQL de secours : pymysql
try:
    import pymysql
    pymysql.install_as_MySQLdb()
except ImportError:
    pass

# Compatibilite Python 3.14 + Django 5.0/5.1:
# django.template.context.BaseContext.__copy__ utilise copy(super()), qui leve
# AttributeError avec Python 3.14 pendant le rendu des templates admin en test.
if sys.version_info >= (3, 14):
    try:
        from django.template.context import BaseContext

        def _copy_base_context(self):
            duplicate = self.__class__.__new__(self.__class__)
            duplicate.__dict__.update(self.__dict__)
            duplicate.dicts = self.dicts[:]
            return duplicate

        BaseContext.__copy__ = _copy_base_context
    except Exception:
        pass
