﻿namespace Cedar.Testing
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using Cedar.Domain;
    using FluentAssertions;

    public static partial class Scenario
    {
        public static Aggregate.Given<T> ForAggregate<T>() where T : IAggregate
        {
            return ForAggregate<T>("testid");
        }

        public static Aggregate.Given<T> ForAggregate<T>(string aggregateId) where T : IAggregate
        {
            var factory = new DefaultAggregateFactory();
            var aggregate = (T) factory.Build(typeof (T), aggregateId);
            return new Aggregate.ScenarioBuilder<T>(aggregate);
        }

        public static Aggregate.Given<T> ForAggregate<T>(T aggregate) where T : IAggregate
        {
            return new Aggregate.ScenarioBuilder<T>(aggregate);
        }

        public static class Aggregate
        {
            public interface Given<out T> : When<T> where T : IAggregate
            {
                When<T> Given(params object[] events);
            }

            public interface When<out T> : Then where T : IAggregate
            {
                Then When(Action<T> when);
            }

            public interface Then
            {
                void Then(params object[] expectedEvents);

                void ThenNothingHappened();

                void ThenShouldThrow<TException>() where TException : Exception;
            }

            internal class ScenarioBuilder<T> : Given<T> where T : IAggregate
            {
                private readonly T _aggregate;
                private Action _given = () => { };
                private Action _when = () => { };

                public ScenarioBuilder(T aggregate)
                {
                    _aggregate = aggregate;
                }

                public When<T> Given(params object[] events)
                {
                    _given = () =>
                    {
                        foreach (var @event in events)
                        {
                            _aggregate.ApplyEvent(@event);
                        }
                    };
                    return this;
                }

                public Then When(Action<T> when)
                {
                    _when = () => when(_aggregate);
                    return this;
                }

                public void Then(params object[] expectedEvents)
                {
                    _given();
                    _when();

                    var uncommittedEvents =
                        new List<object>(_aggregate.GetUncommittedEvents().Cast<object>());
                    uncommittedEvents.ShouldBeEquivalentTo(expectedEvents);
                }

                public void ThenNothingHappened()
                {
                    _given();
                    _when();

                    var uncommittedEvents =
                        new List<object>(_aggregate.GetUncommittedEvents().Cast<object>());
                    uncommittedEvents.Should().BeEmpty();
                }

                public void ThenShouldThrow<TException>() where TException : Exception
                {
                    Action then = () => _when();

                    _given();
                    then.ShouldThrow<TException>();
                }
            }
        }
    }
}