import { startChain } from "../src/index";

test("should give error on properties status and bignumber but not on notanumber", async () => {
    const data = {
        status: "sad",
        bignumber: 10,
        notanumber: NaN,
    };

    const errors = await startChain(data)
        .check("status")
        .validate((value) => value.length === 5 && value === "happy", "Why are you not happy")

        .check("bignumber")
        .validate((value) => value > 10 * 100, "Thats not big")

        .check("notanumber")
        .validate((value) => isNaN(value))

        .pack();

    expect(errors.length).toBe(2);

    expect(errors[0].property).toBe("status");
    expect(errors[0].message).toBe("Why are you not happy");

    expect(errors[1].property).toBe("bignumber");
    expect(errors[1].message).toBe("Thats not big");
});

test("should modify property iwantmodify and give no errors", async () => {
    const data = {
        iwantmodify: "stufftobemodified, stuffnottobemodifed",
    };

    const promiseFunc = () => {
        return new Promise<boolean>((resolve) => {
            setTimeout(() => {
                resolve(true);
            }, 100);
        });
    };

    const errors = await startChain(data)
        .check("iwantmodify")
        .sanitize<string>((value) => value.replace("stufftobemodified", "modified!"))
        .validate<string>((value) => !value.includes("stufftobemodified"))
        .validate(promiseFunc)

        .pack();

    expect(errors.length).toBe(0);

    expect(data.iwantmodify).toBe("modified!, stuffnottobemodifed");
});

test("should give error on properties token and password because username was invalid", async () => {
    const data = {
        username: "Henry",
        password: "Henry's lair is comming",
        token: "184334",
    };

    const errors = await startChain(data)
        .check("username")
        .validate<string>((value) => value == "Henro", "Username does not exist")

        .check("password")
        .ensure("username", "Username is invalid")
        .validate(() => false, "A")

        .check("token")
        .ensure("username")
        .validate(() => false, "B")

        .pack();

    expect(errors.length).toBe(3);

    expect(errors[0].property).toBe("username");
    expect(errors[0].message).toBe("Username does not exist");

    expect(errors[1].property).toBe("password");
    expect(errors[1].message).toBe("Username is invalid");

    expect(errors[2].property).toBe("token");
    expect(errors[2].message).toBe("Username does not exist");
});
