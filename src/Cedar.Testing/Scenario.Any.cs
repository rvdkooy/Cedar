﻿namespace Cedar.Testing
{
    using System;
    using System.ComponentModel;
    using System.IO;
    using System.Linq;
    using System.Linq.Expressions;
    using System.Runtime.CompilerServices;
    using System.Threading.Tasks;
    using FluentAssertions;

    public static partial class Scenario
    {
        public static Any.Given<T> For<T>([CallerMemberName] string scenarioName = null)
        {
            return new Any.ScenarioBuilder<T>(scenarioName);
        }

        public static class Any
        {
            public interface Given<T> : When<T>
            {
                When<T> Given(T instance);
            }

            public interface When<T> : Then<T>
            {
                Then<T> When(Expression<Func<T, T>> when);
                Then<T> When(Expression<Func<T, Task<T>>> when);
            }

            public interface Then<T> : IScenario
            {
                Then<T> ThenShouldEqual(T other);
                Then<T> ThenShouldThrow<TException>(Func<TException, bool> isMatch = null) where TException : Exception;
            }

            internal class ScenarioBuilder<T> : Given<T>
            {
                private readonly string _name;
                
                private readonly Func<T> _runGiven;
                private readonly Func<T, Task<T>> _runWhen;
                private Action<T> _runThen = _ => { };
                private T _given;
                private Expression<Func<T, Task<T>>> _when;
                private T _expect;
                private Exception _occurredException;

                public ScenarioBuilder(string name)
                {
                    _name = name;

                    _runGiven = () => _given;
                    _runWhen = instance => _when.Compile()(instance);
                }

                public When<T> Given(T instance)
                {
                    _given = instance;

                    return this;
                }

                public Then<T> When(Expression<Func<T, T>> when)
                {
                    /*var parameter = Expression.Parameter(typeof (T), "instance");
                    Expression body = Expression.Invoke(, parameter);
                    return When(Expression.Lambda<Func<T, Task<
                        T>>>(body, parameter));*/

                   // return When(async instance => await instance);

                    throw new NotImplementedException();
                }

                public Then<T> When(Expression<Func<T, Task<T>>> when)
                {
                    _when = when;

                    return this;
                }

                public Then<T> ThenShouldEqual(T other)
                {
                    _runThen = instance => instance.Equals(other).Should().BeTrue();
                    return this;
                }

                public Then<T> ThenShouldThrow<TException>(Func<TException, bool> isMatch = null)
                    where TException : Exception
                {
                    isMatch = isMatch ?? (_ => true);

                    _runThen = _ =>
                    {
                        _occurredException.Should().BeOfType<TException>();
                        isMatch((TException)_occurredException).Should().BeTrue();
                    };

                    return this;
                }

                public TaskAwaiter<ScenarioResult> GetAwaiter()
                {
                    IScenario scenario = this;

                    return scenario.Run().GetAwaiter();
                }

                string IScenario.Name
                {
                    get { return _name; }
                }



                async Task<ScenarioResult> IScenario.Run()
                {
                    _given = _runGiven();

                    try
                    {
                        _expect = await _runWhen(_given);
                    }
                    catch (Exception ex)
                    {
                        _occurredException = ex;
                    }

                    _runThen(_expect);

                    return new ScenarioResult(_name, _given, _when, _expect, _occurredException);
                }
            }
        }
    }
}