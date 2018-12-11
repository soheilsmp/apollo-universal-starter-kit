import React from 'react';
import PropTypes from 'prop-types';
import { withFormik } from 'formik';
import { FieldAdapter as Field } from '@module/core-client-react';
import { translate } from '@module/i18n-client-react';
import { match, email, minLength, required, validate } from '@module/validation-common-react';
import { Form, RenderField, Button, Alert } from '@module/look-client-react';

import settings from '../../../../settings';

const registerFormSchema = {
  username: [required, minLength(3)],
  email: [required, email],
  password: [required, minLength(settings.user.auth.password.minLength)],
  passwordConfirmation: [match('password'), required, minLength(settings.user.auth.password.minLength)]
};

const RegisterForm = ({ values, handleSubmit, submitting, errors, t }) => (
  <Form name="register" onSubmit={handleSubmit}>
    <Field
      name="username"
      component={RenderField}
      type="text"
      label={t('reg.form.field.name')}
      value={values.username}
    />
    <Field name="email" component={RenderField} type="text" label={t('reg.form.field.email')} value={values.email} />
    <Field
      name="password"
      component={RenderField}
      type="password"
      label={t('reg.form.field.pass')}
      value={values.password}
    />
    <Field
      name="passwordConfirmation"
      component={RenderField}
      type="password"
      label={t('reg.form.field.passConf')}
      value={values.passwordConfirmation}
    />
    <div className="text-center">
      {errors && errors.validErr && <Alert color="error">{errors.validErr}</Alert>}
      <Button color="primary" type="submit" disabled={submitting}>
        {t('reg.form.btnSubmit')}
      </Button>
    </div>
  </Form>
);

RegisterForm.propTypes = {
  handleSubmit: PropTypes.func,
  submitting: PropTypes.bool,
  errors: PropTypes.object,
  values: PropTypes.object,
  t: PropTypes.func
};

const RegisterFormWithFormik = withFormik({
  mapPropsToValues: () => ({ username: '', email: '', password: '', passwordConfirmation: '' }),
  validate: values => validate(values, registerFormSchema),
  async handleSubmit(
    values,
    {
      setErrors,
      props: { onSubmit }
    }
  ) {
    onSubmit(values).catch(e => {
      setErrors(e);
    });
  },
  enableReinitialize: true,
  displayName: 'SignUpForm' // helps with React DevTools
});

export default translate('user')(RegisterFormWithFormik(RegisterForm));